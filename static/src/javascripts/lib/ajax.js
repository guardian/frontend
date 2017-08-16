// @flow
import reqwest from 'reqwest';
import config from 'lib/config';
import raven from 'lib/raven';
// This should no longer be used.
// Prefer the new 'lib/fetch' or 'lib/fetch-json' library instead, which are es6 compliant.
let ajaxHost = config.page.ajaxUrl || '';

type rejected = (value: any, msg: ?string) => mixed;
type fullfilled = (value: any) => mixed;

export type reqwestPromise = {
    success(callback: fullfilled): reqwestPromise,
    always(callback?: fullfilled): reqwestPromise,
    then(success?: fullfilled, fail?: rejected): reqwestPromise,
    catch(callback: rejected): reqwestPromise,
    error(callback: rejected): reqwestPromise,
    fail(callback: rejected): reqwestPromise,
};

const ajax = (params: Object): reqwestPromise => {
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
