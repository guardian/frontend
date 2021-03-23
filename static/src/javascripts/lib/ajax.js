import config from 'lib/config';
import raven from 'lib/raven';
// This should no longer be used.
// Prefer the new 'lib/fetch' or 'lib/fetch-json' library instead, which are es6 compliant.
let ajaxHost = config.get('page.ajaxUrl', '');

const ajax = (params) => {
    const options = params;

    if (!options.url.match('^(https?:)?//')) {
        options.url = ajaxHost + options.url;
        options.crossOrigin = true;
    }

    const { url, method } = options;
    const headers = { ...options.headers };
    if(options.contentType !== undefined)
        headers['Content-Type'] = options.contentType;


    const init = {
        mode: options.crossOrigin ? 'cors' : undefined,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: options.data ? JSON.stringify(options.data) : undefined,
        credentials: options.withCredentials ? 'include' : undefined,
    }

    if (['GET', 'HEAD'].includes(`${method}`.toUpperCase())) delete init.body;

    const r = fetch(url, init);

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
