define([
    'underscore'
], function(
    _
) {
    var rx = new RegExp(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi),
        el = document.createElement('div');

    return function(s) {
        if (_.isString(s)) {
            el.innerHTML = s;
            return el.innerHTML.replace(rx, '');
        } else {
            return s;
        }
    };
});
