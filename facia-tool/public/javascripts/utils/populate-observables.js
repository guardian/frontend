define(['lodash/objects/isObject', 'lodash/objects/keys'], function(isObject, keys) {
    return function(target, opts) {
        if (!isObject(target) || !isObject(opts)) { return; }
        keys(target).forEach(function(key){
            target[key](opts[key]);
        });
    };
});
