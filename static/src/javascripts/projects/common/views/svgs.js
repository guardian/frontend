/* global console */
// Include any images needed in templates here.
// This file is only required by core, and so has a long cache time.

define([
    'inlineSvg!svgs/icon/comment-16',
    'inlineSvg!svgs/icon/marque-36',
    'inlineSvg!svgs/icon/marque-54',
    'inlineSvg!svgs/icon/market-down',
    'inlineSvg!svgs/icon/market-up',
    'inlineSvg!svgs/icon/market-same',
    'inlineSvg!svgs/icon/arrow',
    'inlineSvg!svgs/icon/arrow-down',
    'inlineSvg!svgs/icon/cross',
    'inlineSvg!svgs/icon/quote',
    'inlineSvg!svgs/logo/logo-guardian',
    'inlineSvg!svgs/commercial/logo-soulmates',
    'inlineSvg!svgs/commercial/soulmates-join',
    'inlineSvg!svgs/commercial/logo-jobs',
    'inlineSvg!svgs/commercial/logo-masterclasses',
    'inlineSvg!svgs/commercial/logo-masterclasses-horizontal',
    'inlineSvg!svgs/commercial/logo-membership-horizontal',
    'inlineSvg!svgs/commercial/logo-jobs-horizontal',
    'inlineSvg!svgs/commercial/logo-bookshop-horizontal',
    'inlineSvg!svgs/commercial/icon-clock',
    'inlineSvg!svgs/commercial/icon-location',
    'inlineSvg!svgs/commercial/icon-basket',
    'inlineSvg!svgs/icon/close-central',
    'inlineSvg!svgs/icon/arrow-white-right',
    'inlineSvg!svgs/icon/arrow-right',
    'inlineSvg!svgs/icon/bookmark',
    'inlineSvg!svgs/icon/dropdown-mask',
    'inlineSvg!svgs/icon/comment-anchor',
    'inlineSvg!svgs/icon/reply',
    'inlineSvg!svgs/icon/expand-image',
    'inlineSvg!svgs/icon/cursor',
    'inlineSvg!svgs/icon/plus',
    'inlineSvg!svgs/icon/share',
    'inlineSvg!svgs/icon/share-twitter',
    'inlineSvg!svgs/icon/share-email',
    'inlineSvg!svgs/icon/share-facebook',
    'inlineSvg!svgs/icon/share-pinterest',
    'inlineSvg!svgs/icon/share-gplus',
    'inlineSvg!svgs/icon/external-link',
    'inlineSvg!svgs/icon/tick',
    'inlineSvg!svgs/logo/glabs-logo-small',
    'inlineSvg!svgs/logo/membership-logo',
    'inlineSvg!svgs/commercial/logo-membership',
    'inlineSvg!svgs/commercial/adblock-coins',
    'inlineSvg!svgs/notifications-explainer-mobile',
    'inlineSvg!svgs/notifications-explainer-desktop',
    'inlineSvg!svgs/commercial/adblock-coins-us',
    'lodash/objects/isArray'
], function (
    commentCount16icon,
    marque36icon,
    marque54icon,
    marketDownIcon,
    marketUpIcon,
    marketSameIcon,
    arrowicon,
    arrowdownicon,
    crossIcon,
    quoteIcon,
    logoguardian,
    logosoulmates,
    logosoulmatesjoin,
    logojobs,
    logomasterclasses,
    logomasterclasseshorizontal,
    logomembershiphorizontal,
    logojobshorizontal,
    logobookshophorizontal,
    iconClock,
    iconLocation,
    iconBasket,
    closeCentralIcon,
    arrowWhiteRight,
    arrowRight,
    bookmark,
    dropdownMask,
    commentAnchor,
    reply,
    expandImage,
    cursor,
    plus,
    share,
    shareTwitter,
    shareEmail,
    shareFacebook,
    sharePinterest,
    shareGPlus,
    externalLink,
    tick,
    glabsLogoSmall,
    membershipLogoWhite,
    membershipLogo,
    adblockCoins,
    notificationsExplainerMobile,
    notificationsExplainerDesktop,
    adblockCoinsUS,
    isArray
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
        quoteIcon: quoteIcon,
        logoguardian: logoguardian,
        logosoulmates: logosoulmates,
        logosoulmatesjoin: logosoulmatesjoin,
        logojobs: logojobs,
        logomasterclasses: logomasterclasses,
        logomasterclasseshorizontal: logomasterclasseshorizontal,
        logomembershiphorizontal: logomembershiphorizontal,
        logojobshorizontal: logojobshorizontal,
        logobookshophorizontal: logobookshophorizontal,
        iconClock: iconClock,
        iconLocation: iconLocation,
        iconBasket: iconBasket,
        closeCentralIcon: closeCentralIcon,
        arrowWhiteRight: arrowWhiteRight,
        arrowRight: arrowRight,
        bookmark: bookmark,
        dropdownMask: dropdownMask,
        commentAnchor: commentAnchor,
        reply: reply,
        expandImage: expandImage,
        cursor: cursor,
        plus: plus,
        share: share,
        shareTwitter: shareTwitter,
        shareEmail: shareEmail,
        shareFacebook: shareFacebook,
        sharePinterest: sharePinterest,
        shareGPlus: shareGPlus,
        externalLink: externalLink,
        tick: tick,
        glabsLogoSmall: glabsLogoSmall,
        adblockCoinsUk: adblockCoins,
        adblockCoinsUs: adblockCoinsUS,
        logomembership: membershipLogo,
        notificationsExplainerMobile: notificationsExplainerMobile,
        notificationsExplainerDesktop: notificationsExplainerDesktop,
        logomembershipwhite: membershipLogoWhite
    };

    return function (name, classes, title) {
        var svg = svgs[name];

        // Only mess with classes if we actually need to.
        if (classes) {
            if (isArray(classes)) {
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
