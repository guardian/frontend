// @flow
import reqwest from 'reqwest';
import config from 'lib/config';
import raven from 'lib/raven';
// This should no longer be used.
// Prefer the new 'lib/fetch' or 'lib/fetch-json' library instead, which are es6 compliant.
let ajaxHost = config.get('page.ajaxUrl', '');

const ajax = (params: Object): any => {
    const options = params;

    if (!options.url.match('^(https?:)?//')) {
        options.url = ajaxHost + options.url;
        options.crossOrigin = true;
    }

    const r = reqwest(options);

    raven.wrap(
        {
            deep: true,
        },
        r.then
    );
    return r;
};

ajax.setHost = host => {
    ajaxHost = host;
};

export { ajax };
