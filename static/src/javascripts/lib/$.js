// @flow

// this is the one place we want to import bonzo - for now...
// eslint-disable-next-line no-restricted-imports
import bonzo from 'bonzo';
import qwery from 'qwery';

// Warning: side effect. This patches the bonzo module for use everywhere
bonzo.aug({
    height() {
        return this.dim().height;
    },
});

// #? this shouldn't really be an `any`, but bonzo is and was previously being 'used' as a type
// this will be good correct whenever we remove bonzo
const $: any = (selector: ?string | ?Node, context?: Node | string): bonzo =>
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

export { $ };
