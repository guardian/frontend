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

export const remarketing: () => ThirdPartyTag = () => {
    const consent = getAdConsentState(thirdPartyTrackingAdConsent);

    return {
        shouldRun:
            config.get('switches.remarketing') && (consent || consent == null),
        url: '//www.googleadservices.com/pagead/conversion_async.js',
        onLoad,
    };
};
