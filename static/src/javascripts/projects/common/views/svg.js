define(function () {
    return svg;

    function svg(svgElement, classes, title) {
        // Only mess with classes if we actually need to.
        if (classes) {
            if (Array.isArray(classes)) {
                svgElement = svg.replace(/class="/, '$&' + classes.join(' ') + ' ');
            } else {
                // Some environments don't support or don't always expose the console object
                if (window.console && window.console.error) {
                    window.console.error('Classes for inlineSvg must be an array: ', classes);
                }
            }
        }

        // Only mess with title if we actually need to.
        if (title) {
            svgElement = svgElement.replace(/<span /, '<span title="' + title + '" ');
        }

        return svgElement;
    }
});
