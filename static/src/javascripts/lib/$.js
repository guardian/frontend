import bonzo from 'bonzo';
import qwery from 'qwery';

// Warning: side effect. This patches the bonzo module for use everywhere
bonzo.aug({
    height() {
        return this.dim().height;
    },
});

function $(selector, context) {
    return bonzo(qwery(selector, context));
}

$.create = s => bonzo(bonzo.create(s));

$.ancestor = (el, className) => {
    if (el.nodeName.toLowerCase() === 'html') {
        return false;
    }
    if (!el.parentNode || bonzo(el.parentNode).hasClass(className)) {
        return el.parentNode;
    }
    return $.ancestor(el.parentNode, className);
};

$.forEachElement = (selector, fn) => {
    const els = qwery(selector);
    els.forEach(fn);
    return els;
};

export default $;
