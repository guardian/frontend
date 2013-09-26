define([
    'models/common',
], function(
    common
) {
    var cache = {},
        expiry = common.config.cacheExpiryMs || 300000; // 300000 == 5 mins

    function put(pot, key, data) {
        var p = cache[pot];

        if (!p) {
            cache[pot] = {};
            p = cache[pot];
        }

        p[key] = {
            data: data,
            // Spread actual timeouts into the range of "two-times expiry"
            time: +new Date() + expiry * Math.random()
        };

        return data;
    }

    function get(pot, key) {
        var p = cache[pot],
            obj = p ? p[key] : undefined;

        if (typeof obj === 'undefined') {
            return;
        }
        if (+new Date() - obj.time > expiry) {
            delete obj;
            return;
        }
        return obj.data;
    }

    return {
        put: put,
        get: get
    }
});
