import bonzo from 'bonzo';
import qwery from 'qwery';
import forEach from 'lodash/collections/forEach';

// Warning: side effect. This patches the bonzo module for use everywhere
bonzo.aug({
    height() {
        return this.dim().height;
    }
});

function $(selector, context) {
    return bonzo(qwery(selector, context));
}

$.create = s => bonzo(bonzo.create(s));

$.ancestor = (el, c) => {
    if (el.nodeName.toLowerCase() === 'html') {
        return false;
    }
    if (!el.parentNode || bonzo(el.parentNode).hasClass(c)) {
        return el.parentNode;
    } else {
        return $.ancestor(el.parentNode, c);
    }
};

$.forEachElement = (selector, fn) => {
    const els = qwery(selector);
    forEach(els, fn);
    return els;
};

export default $; // define
