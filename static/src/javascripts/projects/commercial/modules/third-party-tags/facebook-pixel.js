// @flow
import config from 'lib/config';
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';

export const fbPixel: () => ThirdPartyTag = () => ({
    shouldRun:
        config.switches.facebookTrackingPixel &&
        !!getAdConsentState(thirdPartyTrackingAdConsent),
    url: `https://www.facebook.com/tr?id=${
        config.libs.facebookAccountId
    }&ev=PageView&noscript=1`,
    useImage: true,
});
