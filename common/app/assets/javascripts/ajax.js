define(["reqwest"], function (reqwest) {

    function makeAbsolute(url) {
        return url;
    }

    function ajax(params) {
        params.url = makeAbsolute(params.url);
        return ajax.reqwest(params);
    }

    ajax.reqwest = reqwest; // expose publicly so we can inspect it in unit tests

    return ajax;

});