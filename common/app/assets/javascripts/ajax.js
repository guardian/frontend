define(["reqwest"], function (reqwest) {

    var makeAbsolute = function () {
        throw new Error("AJAX has not been initialised yet");
    };

    var edition = function () {
        throw new Error("Edition has not been initialised yet");
    };

    function appendEdition(params) {
        var delimiter = params.url.indexOf('?') > -1 ? '&' : '?';
        params.url = params.url + delimiter + '_edition=' + edition;
        return params;
    }

    function ajax(params) {

        params = appendEdition(params);

        if (!params.url.match('^https?://')) {
            params.url = makeAbsolute(params.url);
        }
        return ajax.reqwest(params);
    }

    ajax.reqwest = reqwest; // expose publicly so we can inspect it in unit tests

    ajax.init = function (config) {

        edition = config.page.edition;

        makeAbsolute = function (url) {
            return config.page.ajaxUrl + url;
        };
    };

    return ajax;

});
