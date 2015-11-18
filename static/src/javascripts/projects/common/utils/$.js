define([
    'bonzo',
    'qwery',
    'lodash/collections/forEach'
], function (
    bonzo,
    qwery,
    forEach) {

    // Warning: side effect. This patches the bonzo module for use everywhere
    bonzo.aug({
        height: function () {
            return this.dim().height;
        }
    });

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
        forEach(els, fn);
        return els;
    };

    return $;

}); // define
