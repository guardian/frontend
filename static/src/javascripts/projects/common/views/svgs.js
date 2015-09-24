/* global console */
// Include any images needed in templates here.
// This file is only required by core, and so has a long cache time.

define([
    'common/utils/_',
    'inlineSvg!svgs/icon/comment-16',
    'inlineSvg!svgs/icon/marque-36',
    'inlineSvg!svgs/icon/marque-54',
    'inlineSvg!svgs/icon/market-down',
    'inlineSvg!svgs/icon/market-up',
    'inlineSvg!svgs/icon/market-same',
    'inlineSvg!svgs/icon/arrow',
    'inlineSvg!svgs/icon/arrow-down',
    'inlineSvg!svgs/icon/cross',
    'inlineSvg!svgs/logo/logo-guardian',
    'inlineSvg!svgs/commercial/logo-soulmates',
    'inlineSvg!svgs/icon/close-central',
    'inlineSvg!svgs/icon/arrow-white-right',
    'inlineSvg!svgs/icon/arrow-right',
    'inlineSvg!svgs/icon/bookmark',
    'inlineSvg!svgs/icon/dropdown-mask',
    'inlineSvg!svgs/icon/comment-anchor',
    'inlineSvg!svgs/icon/reply',
    'inlineSvg!svgs/icon/expand-image',
    'inlineSvg!svgs/notifications-explainer-mobile',
    'inlineSvg!svgs/notifications-explainer-desktop',
    'inlineSvg!svgs/icon/cursor',
    'inlineSvg!svgs/icon/fb',
    'inlineSvg!svgs/icon/gplus',
    'inlineSvg!svgs/icon/plus',
    'inlineSvg!svgs/icon/external-link'
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
    crossIcon,
    logoguardian,
    logosoulmates,
    closeCentralIcon,
    arrowWhiteRight,
    arrowRight,
    bookmark,
    dropdownMask,
    commentAnchor,
    reply,
    expandImage,
    notificationsExplainerMobile,
    notificationsExplainerDesktop,
    cursor,
    fb,
    gplus,
    plus,
    externalLink
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
        crossIcon: crossIcon,
        logoguardian: logoguardian,
        logosoulmates: logosoulmates,
        closeCentralIcon: closeCentralIcon,
        arrowWhiteRight: arrowWhiteRight,
        arrowRight: arrowRight,
        bookmark: bookmark,
        dropdownMask: dropdownMask,
        commentAnchor: commentAnchor,
        reply: reply,
        expandImage: expandImage,
        notificationsExplainerMobile: notificationsExplainerMobile,
        notificationsExplainerDesktop: notificationsExplainerDesktop,
        cursor: cursor,
        fb: fb,
        gplus: gplus,
        plus: plus,
        externalLink: externalLink
    };

    return function (name, classes, title) {
        var svg = svgs[name];

        // Only mess with classes if we actually need to.
        if (classes) {
            if (_.isArray(classes)) {
                svg = svg.replace(/class="/, '$&' + classes.join(' ') + ' ');
            } else {
                // Some environments don't support or don't always expose the console object
                if (window.console && window.console.error) {
                    window.console.error('Classes for inlineSvg must be an array: ', classes);
                }
            }
        }

        // Only mess with title if we actually need to.
        if (title) {
            svg = svg.replace(/<span /, '<span title="' + title + '" ');
        }

        return svg;
    };
});
