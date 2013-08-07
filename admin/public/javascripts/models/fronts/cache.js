define([
    'models/fronts/common',
], function(
    common
) {
    var cache = {},
        expiry = common.config.cacheExpiryMs || 300000; // 300000 == 5 mins

    function put(pot, key, data) {
        if (!cache[pot]) {
            cache[pot] = {};
        }        
        cache[pot][key] = { 
            data: data,
            // Spread actual timeouts into the range "expiry two-times expiry"
            time: +new Date() + expiry * Math.random() 
        };
    }

    function get(pot, key) {
        var p = cache[pot],
            obj = p ? p[key] : undefined;

        if (typeof obj === 'undefined') {
            return
        }
        return (+new Date()) - obj.time < expiry ? obj.data : undefined; 
    }

    return {
        put: put,
        get: get
    }
});
