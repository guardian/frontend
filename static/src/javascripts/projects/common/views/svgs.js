/* global console */
// Include any images needed in templates here.
// This file is only required by core, and so has a long cache time.

define([
    'common/utils/_',
    'svgs/icon/comment-16!svg',
    'svgs/icon/marque-36!svg',
    'svgs/icon/marque-54!svg',
    'svgs/icon/market-down!svg',
    'svgs/icon/market-up!svg',
    'svgs/icon/market-same!svg',
    'svgs/icon/arrow!svg',
    'svgs/icon/arrow-down!svg',
    'svgs/logo/logo-guardian!svg',
    'svgs/commercial/logo-soulmates!svg',
    'svgs/icon/close-central!svg',
    'svgs/icon/arrow-white-right!svg',
    'svgs/icon/arrow-right!svg',
    'svgs/icon/bookmark!svg',
    'svgs/notifications-explainer-mobile!svg',
    'svgs/notifications-explainer-desktop!svg'
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
    arrowWhiteRight,
    arrowRight,
    bookmark,
    notificationsExplainerMobile,
    notificationsExplainerDesktop
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
        arrowWhiteRight: arrowWhiteRight,
        arrowRight: arrowRight,
        bookmark: bookmark,
        notificationsExplainerMobile: notificationsExplainerMobile,
        notificationsExplainerDesktop: notificationsExplainerDesktop
    };

    return function (name, classes, title) {
        var svg = svgs[name];

        // Only mess with classes if we actually need to.
        if (classes) {
            if (_.isArray(classes)) {
                svg = svg.replace(/class="/, '$&' + classes.join(' ') + ' ');
            } else {
                console.error('Classes for svg must be an array: ', classes);
            }
        }

        // Only mess with title if we actually need to.
        if (title) {
            svg = svg.replace(/<span /, '<span title="' + title + '" ');
        }

        return svg;
    };
});
