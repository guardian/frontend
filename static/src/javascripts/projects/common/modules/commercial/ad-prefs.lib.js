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
    const cookie = [state ? '1' : '0', Date.now()].join(',');
    addCookie(provider.cookie, cookie, 30 * 18, true);
    import('common/modules/analytics/send-ad-prefs').then(module => {
        module.onConsentSet(provider, state);
    });
};

const getAdConsentState = (provider: AdConsent): ?boolean => {
    const cookieRaw = getCookie(provider.cookie);
    if (!cookieRaw) return null;
    const cookieParsed = cookieRaw.split(',')[0];
    if (cookieParsed === '1') return true;
    if (cookieParsed === '0') return false;
    return null;
};

export type { AdConsent };
export {
    setAdConsentState,
    getAdConsentState,
    allAdConsents,
    thirdPartyTrackingAdConsent,
};
