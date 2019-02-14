// @flow
import config from 'lib/config';
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';

export const fbPixel: () => ThirdPartyTag = () => {
    const consent = getAdConsentState(thirdPartyTrackingAdConsent);
    return {
        shouldRun:
            config.switches.facebookTrackingPixel &&
            (consent == null || consent),
        url: `https://www.facebook.com/tr?id=${
            config.libs.facebookAccountId
        }&ev=PageView&noscript=1`,
        useImage: true,
    };
};
