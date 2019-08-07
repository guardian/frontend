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

const init = (): void => {
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

    cmpIsReady = true;
};

type genericCmpFunction = <T>(...T: Array<any>) => any;

/**
 *  Takes function fn and returns new
 *  function that calls init everytime
 *  before returning fn call.
 * */
const makeCmpRobust = (fn: genericCmpFunction): genericCmpFunction => (
    ...args: Array<any>
) => {
    init();
    return fn(...args);
};

const triggerConsentNotification = makeCmpRobust(
    (): void => {
        Object.keys(purposes).forEach(key => {
            const purpose = purposes[key];
            purpose.callbacks.forEach(callback => callback(purpose.state));
        });
    }
);

const onConsentNotification = makeCmpRobust(
    (purposeName: PurposeEvent, callback: PurposeCallback): void => {
        const purpose = purposes[purposeName];

        callback(purpose.state);

        purpose.callbacks.push(callback);
    }
);

const consentState = makeCmpRobust(
    (purposeName: PurposeEvent): boolean | null => purposes[purposeName].state
);

export { onConsentNotification, consentState };

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
