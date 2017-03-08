// @flow
import bonzo from 'bonzo';
import qwery from 'qwery';

// Warning: side effect. This patches the bonzo module for use everywhere
bonzo.aug({
    height() {
        return this.dim().height;
    },
});

function $(selector: string, context: HTMLElement): bonzo {
    return bonzo(qwery(selector, context));
}

$.create = (s: string): bonzo => bonzo(bonzo.create(s));

$.ancestor = (el: Node, className: string) => {
    if (el.nodeName.toLowerCase() === 'html') {
        return false;
    }
    if (!el.parentNode || bonzo(el.parentNode).hasClass(className)) {
        return el.parentNode;
    }
    return $.ancestor(el.parentNode, className);
};

$.forEachElement = (selector: string, fn: Function): Array<number> => {
    const els = qwery(selector);
    els.forEach(fn);
    return els;
};

export default $;
