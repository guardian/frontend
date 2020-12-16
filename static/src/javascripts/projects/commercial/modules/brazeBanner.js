// @flow

import type {Banner} from 'common/modules/ui/bannerPicker';
import config from 'lib/config';
import reportError from 'lib/report-error';
import {onConsentChange} from '@guardian/consent-management-platform';
import {mountDynamic} from "@guardian/automat-modules";
import {submitViewEvent, submitComponentEvent} from 'common/modules/commercial/acquisitions-ophan';
import { getUrlVars } from 'lib/url';
import ophan from 'ophan/ng';
import {getUserFromApi} from 'common/modules/identity/api';
import {isDigitalSubscriber} from "common/modules/commercial/user-features";
import {measureTiming} from './measure-timing';

const brazeVendorId = '5ed8c49c4b8ce4571c7ad801';

const getBrazeUuid = (): Promise<?string> =>
    new Promise((resolve) => {
        getUserFromApi(user => {
            if (user && user.privateFields && user.privateFields.brazeUuid) {
                resolve(user.privateFields.brazeUuid);
            } else {
                resolve();
            }
        })
    });

const hasRequiredConsents = (): Promise<boolean> =>
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

type InAppMessage = {
    extras: {
        [string]: string,
    },
};

type ClickAction = "NEWS_FEED" | "URI" | "NONE"

type InAppMessageButtonInstance = {
    text: string,
    backgroundColor?: number,
    textColor?: number,
    borderColor?: number,
    clickAction?: ClickAction,
    uri?: string,
    id?: number
}

type InAppMessageCallback = (InAppMessage) => void;

type AppBoy = {
    initialize: (string, any) => void,
    subscribeToInAppMessage: (InAppMessageCallback) => {},
    changeUser: (string) => void,
    openSession: () => void,
    logInAppMessageButtonClick: (InAppMessageButtonInstance, InAppMessage) => void,
    logInAppMessageImpression: (InAppMessage) => void,
    InAppMessageButton: (string, ?number, ?number, ?number, ?ClickAction, ?string, ?number) => InAppMessageButtonInstance,
};

type PreCheckArgs = {
    brazeSwitch: boolean,
    apiKey?: string,
    isDigiSubscriber: boolean,
    pageConfig: { [string]: any },
};

const canShowPreChecks = ({
    brazeSwitch,
    apiKey,
    isDigiSubscriber,
    pageConfig,
}: PreCheckArgs) => Boolean(brazeSwitch && apiKey && isDigiSubscriber && !pageConfig.isPaidContent);

let messageConfig: InAppMessage;
let appboy: ?AppBoy;

const FORCE_BRAZE_ALLOWLIST = [
    'preview.gutools.co.uk',
    'preview.code.dev-gutools.co.uk',
    'localhost',
    'm.thegulocal.com',
];

const getMessageFromQueryString = (): InAppMessage | null => {
    const qsArg = 'force-braze-message';

    if (!FORCE_BRAZE_ALLOWLIST.includes(window.location.hostname)) {
        console.log(`${qsArg} is not supported on this domain`)
        return null;
    }

    const params = getUrlVars();
    const value = params[qsArg];

    if (value) {
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

const getMessageFromBraze = async (apiKey: string, brazeUuid: string): Promise<boolean> => {
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

        appboy.subscribeToInAppMessage((message: InAppMessage) => {
            if (message.extras) {
                messageConfig = message;
                resolve(true);
            } else {
                resolve(false);
            }
        });

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

const canShow = async (): Promise<boolean> => {
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
        isDigiSubscriber: isDigitalSubscriber(),
        pageConfig: config.get('page'),
    })) {
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

const show = (): Promise<boolean> => import(
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
                logButtonClickWithBraze: (buttonId: number) => {
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

const brazeBanner: Banner = {
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
