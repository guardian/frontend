// @flow
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';

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

const init = (): void => {
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

    cmpIsReady = true;
};

export const onConsentNotification = (
    purposeName: PurposeEvent,
    callback: PurposeCallback
): void => {
    const purpose = purposes[purposeName];

    if (!cmpIsReady) {
        init();
    }

    callback(purpose.state);

    purpose.callbacks.push(callback);
};

export const consentState = (purposeName: PurposeEvent): boolean | null => {
    if (!cmpIsReady) {
        init();
    }

    return purposes[purposeName].state;
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
