// @flow

import { addCookie, getCookie } from 'lib/cookies';

type AdConsent = {
    label: string,
    cookie: string,
};

const adConsentList: AdConsent[] = [
    {
        label: 'Third party tracking',
        cookie: 'GU_TK',
    },
];

const setAdConsentState = (provider: AdConsent, state: boolean): void => {
    addCookie(provider.cookie, state.toString(), 365 * 6, true);
};

const getAdConsentState = (provider: AdConsent): ?boolean => {
    const cookie = getCookie(provider.cookie);
    if (cookie === 'true') return true;
    if (cookie === 'false') return false;
    return null;
};

export type { AdConsent };
export { setAdConsentState, getAdConsentState, adConsentList };
