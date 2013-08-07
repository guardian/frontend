define([
    'models/fronts/common',
    'knockout'
], function(
    common,
    ko
) {
    var cache = {},
        expiry = common.config.cacheExpiryMs || 300000; // 300000 == 5 mins

    window.frontCache = cache;

    function put(pot, key, data) {
        if (!cache[pot]) {
            cache[pot] = {};
        }
        cache[pot][key] = { 
            data: data,
            // Spread timeouts into the range "expiry to twice expiry"
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
