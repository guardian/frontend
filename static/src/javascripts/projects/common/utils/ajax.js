define([
    'reqwest',
    'common/utils/config',
    'common/utils/get-property'
], function (
    reqwest,
    config,
    getProperty
) {

    var ajaxHost = getProperty(config, 'page.ajaxUrl', '');

    function ajax(params) {
        if (!params.url.match('^https?://')) {
            params.url = ajaxHost + params.url;
            params.crossOrigin = true;
        }
        return reqwest(params);
    }

    ajax.setHost = function (host) {
        ajaxHost = host;
    };

    return ajax;

});
