define(function () {
    return svg;

    function svg(markup, classes, title) {
        // Only mess with classes if we actually need to.
        if (classes) {
            if (Array.isArray(classes)) {
                markup = markup.replace(/class="/, '$&' + classes.join(' ') + ' ');
            } else {
                // Some environments don't support or don't always expose the console object
                if (window.console && window.console.error) {
                    window.console.error('Classes for inlineSvg must be an array: ', classes);
                }
            }
        }

        // Only mess with title if we actually need to.
        if (title) {
            markup = markup.replace(/<span /, '<span title="' + title + '" ');
        }

        return markup;
    }
});
