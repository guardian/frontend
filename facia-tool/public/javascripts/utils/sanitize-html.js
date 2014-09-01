/* global _: true */
define(function() {
    var rx = new RegExp(/<script.*$/);

    return function(s) {
        var el;

        if (_.isString(s)) {
            el = document.createElement('div');
            el.innerHTML = s.replace(rx, '');
            return el.innerHTML;
        } else {
            return s;
        }
    };
});