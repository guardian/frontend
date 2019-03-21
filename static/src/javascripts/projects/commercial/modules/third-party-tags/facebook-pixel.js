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
            config.get('switches.facebookTrackingPixel') &&
            (consent == null || consent),
        url: `https://www.facebook.com/tr?id=${config.get(
            'libs.facebookAccountId'
        )}&ev=PageView&noscript=1`,
        useImage: true,
    };
};
