// @flow
import bonzo from 'bonzo';
import qwery from 'qwery';

// Warning: side effect. This patches the bonzo module for use everywhere
bonzo.aug({
    height() {
        return this.dim().height;
    },
});

function $(selector: string, context: ?Element | ?string): bonzo {
    return bonzo(qwery(selector, context));
}

$.create = (s: string): bonzo => bonzo(bonzo.create(s));

// #? duplicated in lib/closest.js?
$.ancestor = (el: Node | null, className: string) => {
    if (el === null || el.nodeName.toLowerCase() === 'html') {
        return false;
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

export default $;
