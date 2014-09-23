/* global _: true */
define(function() {
    return function(target, opts) {
        if (!_.isObject(target) || !_.isObject(opts)) { return; }
        _.keys(target).forEach(function(key){
            target[key](opts[key]);
        });
    };
});
