// @flow
import config from 'lib/config';

const onLoad = () => {
    window.google_trackConversion({
        google_conversion_id: 971225648,
        google_custom_params: window.google_tag_params,
        google_remarketing_only: true,
    });
};

export const remarketing: () => ThirdPartyTag = () => ({
    shouldRun: config.get('switches.remarketing', false),
    url: '//www.googleadservices.com/pagead/conversion_async.js',
    onLoad,
});
