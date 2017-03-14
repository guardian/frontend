// @flow
/**
 * Adds a wrapper around Element.closest()
 */

function closest(element: ?Element, selectors: string): ?Node {
    if (!element) return null;

    if ('closest' in Element.prototype) {
        return element.closest(selectors) || null;
    }

    let el = element.parentElement;

    while (el && el.nodeType === 1) {
        if (el.matches(selectors)) return el;

        el = el.parentElement;
    }

    return null;
}

export default closest;
