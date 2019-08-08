// @flow
import config from 'lib/config';
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';

const onLoad = () => {
    window.google_trackConversion({
        google_conversion_id: 971225648,
        google_custom_params: window.google_tag_params,
        google_remarketing_only: true,
    });
};

export const remarketing: () => ThirdPartyTag = () => ({
    shouldRun:
        config.get('switches.remarketing') &&
        !!getAdConsentState(thirdPartyTrackingAdConsent),
    url: '//www.googleadservices.com/pagead/conversion_async.js',
    onLoad,
});
