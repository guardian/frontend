// @flow
// Include any images needed in templates here.

import commentCount16icon from 'svg-loader!svgs/icon/comment-16.svg';
import marque36icon from 'svg-loader!svgs/icon/marque-36.svg';
import marque54icon from 'svg-loader!svgs/icon/marque-54.svg';
import marketDownIcon from 'svg-loader!svgs/icon/market-down.svg';
import marketUpIcon from 'svg-loader!svgs/icon/market-up.svg';
import marketSameIcon from 'svg-loader!svgs/icon/market-same.svg';
import arrowicon from 'svg-loader!svgs/icon/arrow.svg';
import arrowdownicon from 'svg-loader!svgs/icon/arrow-down.svg';
import crossIcon from 'svg-loader!svgs/icon/cross.svg';
import quoteIcon from 'svg-loader!svgs/icon/quote.svg';
import paidContent from 'svg-loader!svgs/commercial/paid-content.svg';
import closeCentralIcon from 'svg-loader!svgs/icon/close-central.svg';
import arrowWhiteRight from 'svg-loader!svgs/icon/arrow-white-right.svg';
import arrowRight from 'svg-loader!svgs/icon/arrow-right.svg';
import bookmark from 'svg-loader!svgs/icon/bookmark.svg';
import dropdownMask from 'svg-loader!svgs/icon/dropdown-mask.svg';
import commentAnchor from 'svg-loader!svgs/icon/comment-anchor.svg';
import reply from 'svg-loader!svgs/icon/reply.svg';
import expandImage from 'svg-loader!svgs/icon/expand-image.svg';
import cursor from 'svg-loader!svgs/icon/cursor.svg';
import plus from 'svg-loader!svgs/icon/plus.svg';
import share from 'svg-loader!svgs/icon/share.svg';
import shareTwitter from 'svg-loader!svgs/icon/share-twitter.svg';
import shareEmail from 'svg-loader!svgs/icon/share-email.svg';
import shareFacebook from 'svg-loader!svgs/icon/share-facebook.svg';
import sharePinterest from 'svg-loader!svgs/icon/share-pinterest.svg';
import shareGPlus from 'svg-loader!svgs/icon/share-gplus.svg';
import externalLink from 'svg-loader!svgs/icon/external-link.svg';
import tick from 'svg-loader!svgs/icon/tick.svg';
import notificationsOff from 'svg-loader!svgs/icon/notification-off.svg';
import notificationsOn from 'svg-loader!svgs/icon/notification-on.svg';
import glabsLogoSmall from 'svg-loader!svgs/logo/glabs-logo-small.svg';
import logomembership from 'svg-loader!svgs/commercial/logo-membership.svg';
import adblockCoinsUk from 'svg-loader!svgs/commercial/adblock-coins.svg';
import notificationsExplainerDesktop
    from 'svg-loader!svgs/notifications-explainer-desktop.svg';
import notificationsExplainerMobile
    from 'svg-loader!svgs/notifications-explainer-mobile.svg';
import adblockCoinsUs from 'svg-loader!svgs/commercial/adblock-coins-us.svg';
import star from 'svg-loader!svgs/icon/star.svg';
import chevronRight from 'svg-loader!svgs/icon/chevron-right.svg';

import { addClassesAndTitle } from 'common/views/svg';

const svgs = {
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
    paidContent,
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
    notificationsOff,
    notificationsOn,
    glabsLogoSmall,
    adblockCoinsUk,
    adblockCoinsUs,
    logomembership,
    notificationsExplainerDesktop,
    notificationsExplainerMobile,
    star,
    chevronRight,
};

export const inlineSvg = (
    name: string,
    classes?: Array<string>,
    title?: string
): string => addClassesAndTitle(svgs[name].markup, classes, title);
