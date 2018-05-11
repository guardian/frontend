// @flow

import { addCookie, getCookie } from 'lib/cookies';

const cleanup = (str: string) =>
    str
        .replace(/ /g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toUpperCase();

const getProviderCookieName = (provider: string): string =>
    `GU_PERSONALISED_ADS_${cleanup(provider)}`;

const setProviderState = (provider: string, state: boolean): void => {
    addCookie(getProviderCookieName(provider), state.toString(), 365 * 6, true);
};

const getProviderState = (provider: string): ?boolean => {
    const cookie = getCookie(getProviderCookieName(provider))
    if(cookie === 'true') return true;
    if(cookie === 'false') return false;
    return null;
}

export { setProviderState, getProviderState, getProviderCookieName };
