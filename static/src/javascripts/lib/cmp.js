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

export const onConsentNotification = (
    purposeName: PurposeEvent,
    callback: PurposeCallback
) => {
    const purpose = purposes[purposeName];

    if (cmpIsReady) {
        callback(purpose.state);
    }

    purpose.callbacks.push(callback);
};

// Exporting for testing purposes only
export const triggerConsentNotification = () => {
    Object.keys(purposes).forEach(key => {
        const purpose = purposes[key];
        purpose.callbacks.forEach(callback => callback(purpose.state));
    });
};

export const consentState = (purposeName: PurposeEvent): boolean | null =>
    purposes[purposeName].state;

export const init = () => {
    purposes.functional.state = true;
    purposes.performance.state = true;
    purposes.advertisement.state = getAdConsentState(
        thirdPartyTrackingAdConsent
    );

    cmpIsReady = true;

    triggerConsentNotification();
};
