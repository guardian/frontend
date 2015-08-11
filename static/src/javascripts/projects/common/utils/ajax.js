define([
    'raven',
    'reqwest',
    'common/utils/config',
    'common/utils/get-property'
], function (
    raven,
    reqwest,
    config,
    getProperty
) {
    // This should no longer be used. Prefer the new 'ajax-promise' library instead, which is es6 compliant.
    var ajaxHost = getProperty(config, 'page.ajaxUrl', '');

    function ajax(params) {
        var r;

        if (!params.url.match('^(https?:)?//')) {
            params.url = ajaxHost + params.url;
            params.crossOrigin = true;
        }

        if (!!config && config.page.section === 'money' && config.switches.imgix) {
            if (params.data) {
                params.data.inImgixTest = true;
            } else {
                params.data = { inImgixTest: true };
            }
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
