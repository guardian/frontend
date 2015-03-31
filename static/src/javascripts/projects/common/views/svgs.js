/* global console */
// Include any images needed in templates here.
// This file is only required by core, and so has a long cache time.

define([
    'common/utils/_',
    'inlineSvg!svgs/comment-16!icon',
    'inlineSvg!svgs/marque-36!icon',
    'inlineSvg!svgs/marque-54!icon',
    'inlineSvg!svgs/market-down!icon',
    'inlineSvg!svgs/market-up!icon',
    'inlineSvg!svgs/market-same!icon',
    'inlineSvg!svgs/arrow!icon',
    'inlineSvg!svgs/arrow-down!icon',
    'inlineSvg!svgs/logo-guardian!logo',
    'inlineSvg!svgs/logo-soulmates!commercial',
    'inlineSvg!svgs/close-central!icon',
    'inlineSvg!svgs/arrow-white-right!icon'
], function (
    _,
    commentCount16icon,
    marque36icon,
    marque54icon,
    marketDownIcon,
    marketUpIcon,
    marketSameIcon,
    arrowicon,
    arrowdownicon,
    logoguardian,
    logosoulmates,
    closeCentralIcon,
    arrowWhiteRight
) {
    var svgs = {
        commentCount16icon: commentCount16icon,
        marque36icon: marque36icon,
        marque54icon: marque54icon,
        marketDownIcon: marketDownIcon,
        marketUpIcon: marketUpIcon,
        marketSameIcon: marketSameIcon,
        arrowicon: arrowicon,
        arrowdownicon: arrowdownicon,
        logoguardian: logoguardian,
        logosoulmates: logosoulmates,
        closeCentralIcon: closeCentralIcon,
        arrowWhiteRight: arrowWhiteRight
    };

    return function (name, classes, title) {
        var svg = svgs[name];

        // Only mess with classes if we actually need to.
        if (classes) {
            if (_.isArray(classes)) {
                svg = svg.replace(/class="/, '$&' + classes.join(' ') + ' ');
            } else {
                console.error('Classes for inlineSvg must be an array: ', classes);
            }
        }

        // Only mess with title if we actually need to.
        if (title) {
            svg = svg.replace(/<span /, '<span title="' + title + '" ');
        }

        return svg;
    };
});
