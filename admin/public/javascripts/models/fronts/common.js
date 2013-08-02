define([

], function(

) {
    return {

        config: {
            apiBase: '/fronts/api',
            apiSearchBase: '/api/proxy/search',
            defaultToLiveMode: true
        },

        state: {},

        util: {
            queryParams: function() {
                return _.object(window.location.search.substring(1).split('&').map(function(keyVal){
                    return keyVal.split('=').map(function(s){
                        return decodeURIComponent(s);
                    });
                }));
            },

            fullTrim: function(str){
                return str ? str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ') : undefined;
            }
        }

    };
});
