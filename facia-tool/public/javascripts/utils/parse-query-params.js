define(['utils/url-query', 'lodash/arrays/zipObject'], function(urlQuery, zipObject) {
    return function(url) {
        return zipObject(urlQuery(url).split('&').map(function(keyVal){
            return keyVal.split('=').map(function(s){
                return decodeURIComponent(s);
            });
        }));
    };
});
