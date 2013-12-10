define(['utils/url-query'], function(urlQuery) {
    return function(url) {
        return _.object(urlQuery(url).split('&').map(function(keyVal){
            return keyVal.split('=').map(function(s){
                return decodeURIComponent(s);
            });
        }));
    };
});
