define([
    'raven',
    'reqwest',
    'common/utils/config'
], function (
    raven,
    reqwest,
    config
) {
    // This should no longer be used. Prefer the new 'ajax-promise' library instead, which is es6 compliant.
    var ajaxHost = config.page.ajaxUrl || '';

    function ajax(params) {
        var r;

        if (!params.url.match('^(https?:)?//')) {
            params.url = ajaxHost + params.url;
            params.crossOrigin = true;
        }

        r = reqwest(params);
        raven.wrap({ deep: true }, r.then);
        return r;
    }

    ajax.setHost = function (host) {
        ajaxHost = host;
    };

    return ajax;

});
