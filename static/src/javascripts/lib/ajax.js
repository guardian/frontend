import reqwest from 'reqwest';
import config from 'lib/config';
import raven from 'lib/raven';
// This should no longer be used.
// Prefer the new 'lib/fetch' or 'lib/fetch-json' library instead, which are es6 compliant.
var ajaxHost = config.page.ajaxUrl || '';

function ajax(params) {
    var r;

    if (!params.url.match('^(https?:)?//')) {
        params.url = ajaxHost + params.url;
        params.crossOrigin = true;
    }

    r = reqwest(params);
    raven.wrap({
        deep: true
    }, r.then);
    return r;
}

ajax.setHost = function(host) {
    ajaxHost = host;
};

export default ajax;
