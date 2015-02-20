define([
    'underscore'
], function(
    _
) {
    return function(target, opts) {
        if (!_.isObject(target) || !_.isObject(opts)) { return; }
        _.keys(target).forEach(function(key){
            if (_.isFunction(target[key]) && _.isUndefined(target[key]())) {
                target[key](opts[key]);
            }
        });
    };
});
