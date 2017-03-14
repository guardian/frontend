// @flow
/**
 * Adds a wrapper around Element.closest()
 */

function closestPoly(element, selectors) {
    let el = element.parentNode;

    while (el && el.nodeType === 1) {
        if (el.matches(selectors)) {
            return el;
        }

        el = el.parentNode;
    }

    return null;
}

function closest(element: Element, selectors: string): Node | null {
    if ('closest' in Element.prototype) {
        
        return element.closest(selectors) || null;
    }

    return closestPoly(element, selectors);
}

export { closest as default, closestPoly as _closestPoly };
