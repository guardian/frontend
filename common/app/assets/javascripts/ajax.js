define(["reqwest"], function (reqwest) {

    var makeAbsolute = function () {
        throw new Error("AJAX has not been initialised yet");
    };

    function ajax(params) {
        if(params.url.lastIndexOf("http://", 0)!==0){
            params.url = makeAbsolute(params.url);
        }
        return ajax.reqwest(params);
    }

    ajax.reqwest = reqwest; // expose publicly so we can inspect it in unit tests

    ajax.init = function (absoluteUrl) {
        makeAbsolute = function (url) {
            return absoluteUrl + url;
        };
    };

    return ajax;

});