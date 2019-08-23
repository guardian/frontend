// @flow
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';

const CMP_DOMAIN = 'https://manage.theguardian.com';
const CMP_SAVED_MSG = 'savedCmp';

type PurposeEvent = 'functional' | 'performance' | 'advertisement';

type PurposeCallback = (state: boolean | null) => void;

type Purpose = {
    state: boolean | null,
    callbacks: Array<PurposeCallback>,
};

let cmpIsReady = false;

const purposes: { [PurposeEvent]: Purpose } = {
    functional: {
        state: null,
        callbacks: [],
    },
    performance: {
        state: null,
        callbacks: [],
    },
    advertisement: {
        state: null,
        callbacks: [],
    },
};

const triggerConsentNotification = (): void => {
    Object.keys(purposes).forEach(key => {
        const purpose = purposes[key];
        purpose.callbacks.forEach(callback => callback(purpose.state));
    });
};

const receiveMessage = (event: MessageEvent) => {
    const { origin, data } = event;

    // triggerConsentNotification when CMP_SAVED_MSG emitted from CMP_DOMAIN
    if (origin === CMP_DOMAIN && data === CMP_SAVED_MSG) {
        triggerConsentNotification();
    }
};

const checkCmpReady = (): void => {
    if (cmpIsReady) {
        return;
    }

    /**
     * These state assignments are temporary
     * and will eventually be replaced by values
     * read from the CMP cookie.
     * */
    purposes.functional.state = true;
    purposes.performance.state = true;
    purposes.advertisement.state = getAdConsentState(
        thirdPartyTrackingAdConsent
    );

    // listen for postMessage events from CMP UI
    window.addEventListener('message', receiveMessage, false);

    cmpIsReady = true;
};

export const onConsentNotification = (
    purposeName: PurposeEvent,
    callback: PurposeCallback
): void => {
    checkCmpReady();

    const purpose = purposes[purposeName];

    callback(purpose.state);

    purpose.callbacks.push(callback);
};

// Exposed for testing purposes
export const _ = {
    triggerConsentNotification,
    resetCmp: (): void => {
        cmpIsReady = false;
        Object.keys(purposes).forEach(key => {
            const purpose = purposes[key];
            purpose.state = null;
            purpose.callbacks = [];
        });
    },
};
