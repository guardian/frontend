// @flow strict
import config from 'lib/config';
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';

const onLoad = () => {
    // Insert Twitter Pixel ID and Standard Event data below
    if (window.twq) {
        window.twq('init', 'nyl43');
        window.twq('track', 'PageView');
    }
};

// Twitter universal website tag code
export const twitterUwt: () => ThirdPartyTag = () => ({
    shouldRun:
        config.get('switches.twitterUwt', false) &&
        !!getAdConsentState(thirdPartyTrackingAdConsent),
    url: '//static.ads-twitter.com/uwt.js',
    onLoad,
});
