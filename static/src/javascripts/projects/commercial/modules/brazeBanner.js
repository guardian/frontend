// @flow

import type {Banner} from 'common/modules/ui/bannerPicker';
import config from 'lib/config';
import reportError from 'lib/report-error';
import {onConsentChange} from '@guardian/consent-management-platform';
import {mountDynamic} from "@guardian/automat-modules";

import {getUserFromApi} from '../../common/modules/identity/api';
import {isDigitalSubscriber} from "../../common/modules/commercial/user-features";

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

const canShow = async (): Promise<boolean> => {
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
        appboy = await import(/* webpackChunkName: "braze-web-sdk-core" */ '@braze/web-sdk-core');

        appboy.initialize(apiKey, {
            enableLogging: false,
            noCookies: true,
            baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
            sessionTimeoutInSeconds: 1,
            minimumIntervalBetweenTriggerActionsInSeconds: 0,
        });

        return new Promise(resolve => {
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
    } catch (e) {
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
                onButtonClick: (buttonId: number) => {
                    if (appboy) {
                        const thisButton = new appboy.InAppMessageButton(`Button ${buttonId}`,null,null,null,null,null,buttonId)
                        appboy.logInAppMessageButtonClick(
                            thisButton, messageConfig
                        );
                    }
                },
                brazeMessageProps: messageConfig.extras,
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
    canShowPreChecks,
}
