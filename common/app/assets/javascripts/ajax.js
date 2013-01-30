define(["reqwest"], function (reqwest) {

    var absoluteUrl = undefined;

    function makeAbsolute(url) {
        return absoluteUrl + url;
    }

    function ajax(params) {
        params.url = makeAbsolute(params.url);
        return ajax.reqwest(params);
    }

    ajax.reqwest = reqwest; // expose publicly so we can inspect it in unit tests

    ajax.init = function(url) {
       absoluteUrl = url;
    };

    return ajax;

});