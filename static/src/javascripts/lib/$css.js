// @flow
// x-browser function to get a style value from a bonzo object
// bonzo needs these - use currentStyle (not as reliable?) if unavailable (e.g. IE8)
// #? – we don't support IE8
export default ($el: bonzo, prop: string) =>
    window.document.defaultView && window.document.defaultView.getComputedStyle
        ? $el.css(prop)
        : $el[0].currentStyle[prop];
