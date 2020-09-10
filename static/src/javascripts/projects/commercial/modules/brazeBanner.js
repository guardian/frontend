// @flow

import type {Banner} from 'common/modules/ui/bannerPicker';
import config from 'lib/config';
import reportError from 'lib/report-error';
import {onConsentChange} from '@guardian/consent-management-platform';
import {mountDynamic} from "@guardian/automat-modules";

import {getUserFromApi} from '../../common/modules/identity/api';
import {isDigitalSubscriber} from "../../common/modules/commercial/user-features";

const brazeSwitch = config.get('switches.brazeSwitch');
const apiKey = config.get('page.brazeApiKey');
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
        onConsentChange(({ tcfv2, ccpa }) => {
            if (tcfv2) {
                resolve(tcfv2.vendorConsents[brazeVendorId]);
            } else if (ccpa) {
                resolve(!ccpa.doNotSell);
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

type InAppMessageButton = (null, null, null, null, null, null, string);
type InAppMessageCallback = (InAppMessage) => void;

type AppBoy = {
    initialize: (string, any) => void,
    subscribeToInAppMessage: (InAppMessageCallback) => {},
    changeUser: (string) => void,
    openSession: () => void,
    logInAppMessageClick: (InAppMessage) => void;
    logInAppMessageImpression: (InAppMessage) => void;
    InAppMessageButton: InAppMessageButton
};

let messageConfig: InAppMessage;
let appboy: ?AppBoy;

const canShow = (): Promise<boolean> =>
    new Promise(async resolve => {
        try {
            if (!(brazeSwitch && apiKey)) {
                throw new Error("Braze not enabled or API key not available");
            }

            if (!isDigitalSubscriber()) {
                resolve(false);
                return;
            }

            const [brazeUuid, hasGivenConsent] = await Promise.all([getBrazeUuid(), hasRequiredConsents()]);

            if (!(brazeUuid && hasGivenConsent)) {
                resolve(false);
                return;
            }

            appboy = await import(/* webpackChunkName: "braze-web-sdk-core" */ '@braze/web-sdk-core');

            appboy.initialize(apiKey, {
                enableLogging: false,
                noCookies: true,
                baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
                sessionTimeoutInSeconds: 1,
                minimumIntervalBetweenTriggerActionsInSeconds: 0,
            });

            appboy.subscribeToInAppMessage((message: InAppMessage) => {
                messageConfig = message;
                resolve(true);
            });

            appboy.changeUser(brazeUuid);
            appboy.openSession();
        } catch (e) {
            resolve(false);
        }
    });

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
            module.DigitalSubscriberAppBanner,
            {
                onButtonClick: () => {
                    if (appboy) {
                        const thisButton = new appboy.InAppMessageButton(null,null,null,null,null,null,parseInt(buttonId))
                        appboy.logInAppMessageButtonClick(
                            thisButton, messageConfig
                        );
                    }
                },
                header: messageConfig.extras["header"],
                body: messageConfig.extras["body"],
            },
            true,
        );

        if (appboy) {
            // Log the impression with Braze
            appboy.logInAppMessageImpression(messageConfig);
        }

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
}
