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

    const { url } = options;
    const headers = new Headers();
    if(options.headers !== undefined) headers.append( options.headers );
    if(options.contentType !== undefined)
        headers.append('Content-Type', options.contentType );
    let headerSize = 0;
    headers.forEach(() => { headerSize++ });


    const initArray = Object.entries({
        mode: options.crossOrigin ? 'cors' : null,
        headers: headerSize > 0 ? headers : null,
        body: options.data ? JSON.stringify(options.data) : null,
        credentials: options.withCredentials ? 'include' : null,
    }).filter( e => e[1] !== null )

    const init = initArray.length > 0 ? Object.fromEntries(initArray) : undefined;

    const r = init === undefined ? fetch(url) : fetch(url, init);

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
