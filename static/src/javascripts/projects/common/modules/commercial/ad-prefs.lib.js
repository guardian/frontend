import { addCookie, getCookie } from '../../../../lib/cookies';
import { onConsentSet } from '../analytics/send-privacy-prefs';

/*
 * Where is this file used outside the commercial bundle?
 * - static/src/javascripts/bootstraps/enhanced/common.js
 * - static/src/javascripts/projects/common/modules/identity/ad-prefs.js
 * - static/src/javascripts/projects/common/modules/identity/ad-prefs/wordings.js
 */

const cookieExpiryDate = 30 * 18;

const thirdPartyTrackingAdConsent = {
    label: 'Third party tracking',
    cookie: 'GU_TK',
};

const allAdConsents = [thirdPartyTrackingAdConsent];

const setAdConsentState = (provider, state) => {
    const cookie = [state ? '1' : '0', Date.now()].join('.');
    addCookie(provider.cookie, cookie, cookieExpiryDate, true);
    onConsentSet(provider, state);
};

const getAdConsentState = (provider) => {
    const cookieRaw = getCookie(provider.cookie);
    if (!cookieRaw) return null;
    const cookieParsed = cookieRaw.split('.')[0];
    if (cookieParsed === '1') return true;
    if (cookieParsed === '0') return false;
    return null;
};

const getAllAdConsentsWithState = () =>
    allAdConsents.map((consent) => ({
        consent,
        state: getAdConsentState(consent),
    }));

export {
    setAdConsentState,
    getAdConsentState,
    getAllAdConsentsWithState,
    allAdConsents,
    thirdPartyTrackingAdConsent,
};
