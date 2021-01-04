import config from 'lib/config';
import reportError from 'lib/report-error';
import {onConsentChange} from '@guardian/consent-management-platform';
import {mountDynamic} from "@guardian/automat-modules";
import {submitViewEvent, submitComponentEvent} from 'common/modules/commercial/acquisitions-ophan';
import { getUrlVars } from 'lib/url';
import ophan from 'ophan/ng';
import {getUserFromApi} from 'common/modules/identity/api';
import {shouldNotBeShownSupportMessaging} from "common/modules/commercial/user-features";
import {measureTiming} from './measure-timing';

const brazeVendorId = '5ed8c49c4b8ce4571c7ad801';

const getBrazeUuid = () =>
    new Promise((resolve) => {
        getUserFromApi(user => {
            if (user && user.privateFields && user.privateFields.brazeUuid) {
                resolve(user.privateFields.brazeUuid);
            } else {
                resolve();
            }
        })
    });

const hasRequiredConsents = () =>
    new Promise((resolve) => {
        onConsentChange(({ tcfv2, ccpa, aus }) => {
            if (tcfv2) {
                resolve(tcfv2.vendorConsents[brazeVendorId]);
            } else if (ccpa) {
                resolve(!ccpa.doNotSell);
            } else if (aus) {
                resolve(aus.personalisedAdvertising);
            } else {
                resolve(false);
            }
        })
    });







const canShowPreChecks = ({
    brazeSwitch,
    apiKey,
    userIsGuSupporter,
    pageConfig,
}) => Boolean(brazeSwitch && apiKey && userIsGuSupporter && !pageConfig.isPaidContent);

let messageConfig;
let appboy;

const FORCE_BRAZE_ALLOWLIST = [
    'preview.gutools.co.uk',
    'preview.code.dev-gutools.co.uk',
    'localhost',
    'm.thegulocal.com',
];

const getMessageFromQueryString = () => {
    const qsArg = 'force-braze-message';

    const params = getUrlVars();
    const value = params[qsArg];

    if (value) {
        if (!FORCE_BRAZE_ALLOWLIST.includes(window.location.hostname)) {
            console.log(`${qsArg} is not supported on this domain`)
            return null;
        }

        try {
            const dataFromBraze = JSON.parse(value);

            return {
                extras: dataFromBraze,
            };
        } catch (e) {
            // Parsing failed. Log a message and fall through.
            console.log(
                `There was an error with ${qsArg}:`,
                e.message,
            );
        }
    }

    return null;
};

const getMessageFromBraze = async (apiKey, brazeUuid) => {
    const sdkLoadTiming = measureTiming('braze-sdk-load');
    sdkLoadTiming.start();

    appboy = await import(/* webpackChunkName: "braze-web-sdk-core" */ '@braze/web-sdk-core');

    const sdkLoadTimeTaken = sdkLoadTiming.end();
    ophan.record({
        component: 'braze-sdk-load-timing',
        value: sdkLoadTimeTaken,
    });

    const appboyTiming = measureTiming('braze-appboy');
    appboyTiming.start();

    appboy.initialize(apiKey, {
        enableLogging: false,
        noCookies: true,
        baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
        sessionTimeoutInSeconds: 1,
        minimumIntervalBetweenTriggerActionsInSeconds: 0,
    });

    const canShowPromise = new Promise(resolve => {
        // Needed to keep Flow happy
        if (!appboy) {
            resolve(false);
            return;
        }

        let subscriptionId;

        const callback = (message) => {
            if (message.extras) {
                messageConfig = message;
                resolve(true);
            } else {
                resolve(false);
            }

            if (appboy && subscriptionId) {
                appboy.removeSubscription(subscriptionId);
            }
        };

        // Keep hold of the subscription ID so that we can unsubscribe in the
        // callback, ensuring that the callback is only invoked once per page
        subscriptionId = appboy.subscribeToInAppMessage(callback);

        appboy.changeUser(brazeUuid);
        appboy.openSession();
    });

    canShowPromise.then(() => {
        const appboyTimeTaken = appboyTiming.end();

        ophan.record({
            component: 'braze-appboy-timing',
            value: appboyTimeTaken,
        });
    }).catch(() => {
        appboyTiming.clear()
        console.log("Appboy Timing failed.");
    });

    return canShowPromise
};

const canShow = async () => {
    const bannerTiming = measureTiming('braze-banner');
    bannerTiming.start();

    const forcedBrazeMessage = getMessageFromQueryString();
    if (forcedBrazeMessage) {
        messageConfig = forcedBrazeMessage;
        return true;
    }

    const brazeSwitch = config.get('switches.brazeSwitch');
    const apiKey = config.get('page.brazeApiKey');

    if (!canShowPreChecks({
        brazeSwitch,
        apiKey,
        userIsGuSupporter: shouldNotBeShownSupportMessaging(),
        pageConfig: config.get('page'),
    })) {
        // Currently all active web canvases in Braze target existing supporters,
        // subscribers or otherwise those with a Guardian product. We can use the
        // value of `shouldNotBeShownSupportMessaging` to identify these users,
        // limiting the number of requests we need to initialise Braze on the page:
        return false;
    }

    const [brazeUuid, hasGivenConsent] = await Promise.all([getBrazeUuid(), hasRequiredConsents()]);

    if (!(brazeUuid && hasGivenConsent)) {
        return false;
    }

    try {
        const result = await getMessageFromBraze(apiKey, brazeUuid)
        const timeTaken = bannerTiming.end();

        if (timeTaken) {
            ophan.record({
                component: 'braze-banner-timing',
                value: timeTaken,
            });
        }

        return result;
    } catch (e) {
        bannerTiming.clear()
        return false;
    }
};

const show = () => import(
    /* webpackChunkName: "guardian-braze-components" */ '@guardian/braze-components'
    )
    .then((module) => {
        const container = document.createElement('div');
        container.classList.add('site-message--banner');

        // The condition here is to keep flow happy
        if (document.body) {
            document.body.appendChild(container);
        }

        mountDynamic(
            container,
            module.BrazeMessage,
            {
                componentName: messageConfig.extras.componentName,
                logButtonClickWithBraze: (buttonId) => {
                    if (appboy) {
                        const thisButton = new appboy.InAppMessageButton(`Button ${buttonId}`,null,null,null,null,null,buttonId)
                        appboy.logInAppMessageButtonClick(
                            thisButton, messageConfig
                        );
                    }
                },
                submitComponentEvent,
                brazeMessageProps: messageConfig.extras,
            },
            true,
        );

        if (appboy) {
            // Log the impression with Braze
            appboy.logInAppMessageImpression(messageConfig);
        }

        // Log the impression with Ophan
        submitViewEvent({
            component: {
                componentType: 'RETENTION_ENGAGEMENT_BANNER',
                id: messageConfig.extras.componentName,
            },
        });

        return true;
    })
    .catch((error) => {
        const msg = `Error with remote Braze component: ${error}`;
        reportError(new Error(msg), {}, false);

        return false;
    });

const brazeBanner = {
    id: 'brazeBanner',
    show,
    canShow,
};

export {
    brazeBanner,
    brazeVendorId,
    hasRequiredConsents,
    canShowPreChecks,
}
