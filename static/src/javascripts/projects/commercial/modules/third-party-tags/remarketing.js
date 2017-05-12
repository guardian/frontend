// @flow
import config from 'lib/config';

const remarketingUrl = '//www.googleadservices.com/pagead/conversion_async.js';

const onLoad = function() {
    window.google_trackConversion({
        google_conversion_id: 971225648,
        google_custom_params: window.google_tag_params,
        google_remarketing_only: true,
    });
};

const shouldRun = config.switches.remarketing;

const url = remarketingUrl;

export { shouldRun, url, onLoad };
