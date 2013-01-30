define(["reqwest"], function (reqwest) {

    function makeAbsolute(url) {
        return url;
    }

    function ajax(params) {
        params.url = makeAbsolute(params.url);
        return reqwest(params);
    }

    return ajax;

});