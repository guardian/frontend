define([
    'underscore'
], function(
    _
) {
    return function(s) {
        if (_.isString(s)) {
            return s.split(/\s+/).filter(function(s) { return s; }).join(' ');
        } else {
            return s;
        }
    };
});



