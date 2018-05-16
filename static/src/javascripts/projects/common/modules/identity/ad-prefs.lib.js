// @flow

import { addCookie, getCookie } from 'lib/cookies';

type AdConsent = {
    label: string,
    cookie: string,
};

const thirdPartyTrackingAdConsent: AdConsent = {
    label: 'Third party tracking',
    cookie: 'GU_TK',
};

const allAdConsents: AdConsent[] = [thirdPartyTrackingAdConsent];

const setAdConsentState = (provider: AdConsent, state: boolean): void => {
    addCookie(provider.cookie, state ? '1' : '0', 365 * 6, true);
};

const getAdConsentState = (provider: AdConsent): ?boolean => {
    const cookie = getCookie(provider.cookie);
    if (cookie === '1') return true;
    if (cookie === '0') return false;
    return null;
};

export type { AdConsent };
export {
    setAdConsentState,
    getAdConsentState,
    allAdConsents,
    thirdPartyTrackingAdConsent,
};
