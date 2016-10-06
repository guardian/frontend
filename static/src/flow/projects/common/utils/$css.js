define(function () {

    /**
     * x-browser function to get a style value from a bonzo object
     */
    return function ($el, prop) {
        // bonzo needs these - use currentStyle (not as reliable?) if unavailable (e.g. IE8)
        return (window.document.defaultView && window.document.defaultView.getComputedStyle)
            ? $el.css(prop) : $el[0].currentStyle[prop];
    };

});
