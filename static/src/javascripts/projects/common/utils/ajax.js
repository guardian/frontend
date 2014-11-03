define([
    'reqwest',
    'common/utils/config'
], function (
    reqwest,
    config
) {

    var ajaxHost = config.page.ajaxUrl || '';

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
