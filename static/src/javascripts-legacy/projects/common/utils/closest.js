define(function () {
    /**
     * Adds a wrapper around Element.closest()
     */
    return 'closest' in Element.prototype ? closestNative : closestPolyfill;

    function closestNative(element, selectors) {
        return element.closest(selectors);
    }

    function closestPolyfill(element, selectors) {
        while (element && !element.matches(selectors)) {
            element = element.parentNode;
        }
        return element;
    }
});
