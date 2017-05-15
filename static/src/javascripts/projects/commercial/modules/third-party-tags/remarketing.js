// @flow
import config from 'lib/config';

const remarketingUrl = '//www.googleadservices.com/pagead/conversion_async.js';

const onLoad = function(): void {
    window.google_trackConversion({
        google_conversion_id: 971225648,
        google_custom_params: window.google_tag_params,
        google_remarketing_only: true,
    });
};

const shouldRun: boolean = config.switches.remarketing;

const url: string = remarketingUrl;

export { shouldRun, url, onLoad };
