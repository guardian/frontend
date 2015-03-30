define([
    'bonzo',
    'qwery',
    'common/utils/_'
], function (
    bonzo,
    qwery,
    _
) {

    function $(selector, context) {
        return bonzo(qwery(selector, context));
    }
    $.create = function (s) {
        return bonzo(bonzo.create(s));
    };
    $.ancestor = function (el, c) {
        if (el.nodeName.toLowerCase() === 'html') {
            return false;
        }
        if (!el.parentNode || bonzo(el.parentNode).hasClass(c)) {
            return el.parentNode;
        } else {
            return $.ancestor(el.parentNode, c);
        }
    };
    $.forEachElement = function (selector, fn) {
        var els = qwery(selector);
        _.forEach(els, fn);
        return els;
    };
    return $;

}); // define
