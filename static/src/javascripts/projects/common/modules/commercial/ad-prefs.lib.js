// @flow

import { addCookie, getCookie } from 'lib/cookies';
import { onConsentSet } from 'common/modules/analytics/send-privacy-prefs';

type AdConsent = {
    label: string,
    cookie: string,
};

type AdConsentWithState = {
    consent: AdConsent,
    state: ?boolean,
};

const cookieExpiryDate = 30 * 18;

const thirdPartyTrackingAdConsent: AdConsent = {
    label: 'Third party tracking',
    cookie: 'GU_TK',
};

const allAdConsents: AdConsent[] = [thirdPartyTrackingAdConsent];

const setAdConsentState = (provider: AdConsent, state: boolean): void => {
    const cookie = [state ? '1' : '0', Date.now()].join('.');
    addCookie(provider.cookie, cookie, cookieExpiryDate, true);
    onConsentSet(provider, state);
};

const getAdConsentState = (provider: AdConsent): boolean | null => {
    const cookieRaw = getCookie(provider.cookie);
    if (!cookieRaw) return null;
    const cookieParsed = cookieRaw.split('.')[0];
    if (cookieParsed === '1') return true;
    if (cookieParsed === '0') return false;
    return null;
};

const getAllAdConsentsWithState = (): AdConsentWithState[] =>
    allAdConsents.map((consent: AdConsent) => ({
        consent,
        state: getAdConsentState(consent),
    }));

export type { AdConsent, AdConsentWithState };
export {
    setAdConsentState,
    getAdConsentState,
    getAllAdConsentsWithState,
    allAdConsents,
    thirdPartyTrackingAdConsent,
};
