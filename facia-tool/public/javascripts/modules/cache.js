define([
    'modules/vars'
], function(
    vars
) {
    var cache = {},
        expiry = vars.CONST.cacheExpiryMs || 300000; // 300000 == 5 mins

    function put(pot, key, data) {
        var p;

        if (!pot || !key) { return; }

        p = cache[pot];

        if (!p) {
            p = cache[pot] = {};
        }

        p[key] = {
            data: JSON.stringify(data),

            // Spread actual timeouts into the range of "two-times expiry"
            time: +new Date() + expiry * Math.random()
        };

        return data;
    }

    function get(pot, key) {
        var p,
            obj;

        if (!pot || !key) { return; }

        p = cache[pot];
        obj = p ? p[key] : undefined;

        if (!obj) { return; }

        if (+new Date() - obj.time > expiry) {
            delete obj;
            return;
        }

        return obj.data ? JSON.parse(obj.data) : undefined;
    }

    return {
        put: put,
        get: get
    }
});
