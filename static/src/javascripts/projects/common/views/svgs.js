// Include any images needed in templates here.
// This file is only required by core, and so has a long cache time.

define([
    'inlineSvg!svgs/marque-36!icon',
    'inlineSvg!svgs/marque-54!icon',
    'inlineSvg!svgs/arrow-down!icon',
    'inlineSvg!svgs/logo-guardian!logo',
    'inlineSvg!svgs/logo-soulmates!commercial'
], function (
    marque36icon,
    marque54icon,
    arrowdownicon,
    logoguardian,
    logosoulmates
) {
    var svgs = {
        marque36icon: marque36icon,
        marque54icon: marque54icon,
        arrowdownicon: arrowdownicon,
        logoguardian: logoguardian,
        logosoulmates: logosoulmates
    };

    return function (name, classes, title) {
        var svg = svgs[name];

        // Only mess with classes if we actually need to.
        if (classes) {
            svg = svg.replace(/class="/, '$&' + classes.join(' ') + ' ');
        }

        // Only mess with title if we actually need to.
        if (title) {
            svg = svg.replace(/<span /, '<span title="' + title + '" ');
        }

        return svg;
    };
});
