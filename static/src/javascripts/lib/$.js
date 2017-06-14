// @flow
import bonzo from 'bonzo';
import qwery from 'qwery';

// Warning: side effect. This patches the bonzo module for use everywhere
bonzo.aug({
    height() {
        return this.dim().height;
    },
});

// #? Use of `Node` throughout this file may need a second look?
const $ = (selector: ?string | ?Node, context: ?Node | ?string): bonzo =>
    bonzo(qwery(selector, context));

$.create = (s: string | Node): bonzo => bonzo(bonzo.create(s));

// #? duplicated in lib/closest.js?
$.ancestor = (el: ?Node, className: string): ?Node => {
    if (
        el === null ||
        el === undefined ||
        el.nodeName.toLowerCase() === 'html'
    ) {
        return null;
    }
    if (!el.parentNode || bonzo(el.parentNode).hasClass(className)) {
        return el.parentNode;
    }
    return $.ancestor(el.parentNode, className);
};

// #? does this offer any value?
$.forEachElement = (selector: string, fn: Function): Array<Element> => {
    const els = qwery(selector);
    els.forEach(fn);
    return els;
};

// #es6 can be named exports once we're es6-only
// eslint-disable-next-line guardian-frontend/no-default-export
export default $;
