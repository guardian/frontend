// @flow
import config from 'lib/config';
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';

export const fbPixel: () => ThirdPartyTag = () =>
    // console.log(
    //     // config.get('switches.facebookTrackingPixel'),
    //     config.switches,
    //     getAdConsentState(thirdPartyTrackingAdConsent),
    //     // config.switches.facebookTrackingPixel && getAdConsentState(thirdPartyTrackingAdConsent)
    // );
    ({
        shouldRun:
            config.switches.facebookTrackingPixel &&
            !!getAdConsentState(thirdPartyTrackingAdConsent),
        url: `https://www.facebook.com/tr?id=${
            config.libs.facebookAccountId
        }&ev=PageView&noscript=1`,
        useImage: true,
    });
