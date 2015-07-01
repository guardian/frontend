import {CONST} from 'modules/vars';

export let overrides = {
    Date: Date
};

var cache = {},
    expiry = CONST.cacheExpiryMs || 300000; // 300000 == 5 mins

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
        time: +new overrides.Date() + expiry * Math.random()
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

    if (+new overrides.Date() - obj.time > expiry) {
        delete p[key];
        return;
    }

    return obj.data ? JSON.parse(obj.data) : undefined;
}

export {put, get};
