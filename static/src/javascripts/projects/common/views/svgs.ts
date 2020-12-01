// DEPRECATED: please don't use this file to inject SVGs into your markup
// Instead load the SVGs directly into your JavaScript module

// If you must add a new SVG file here, please reflect this in:
// static/test/javascripts-legacy/helpers/svg-paths.js

import { addClassesAndTitle } from 'common/views/svg';
import logomembership from 'svgs/commercial/logo-membership.svg';
import paidContent from 'svgs/commercial/paid-content.svg';
import arrowdownicon from 'svgs/icon/arrow-down.svg';
import arrowRight from 'svgs/icon/arrow-right.svg';
import arrowWhiteRight from 'svgs/icon/arrow-white-right.svg';
import arrowicon from 'svgs/icon/arrow.svg';
import bookmark from 'svgs/icon/bookmark.svg';
import chevronRight from 'svgs/icon/chevron-right.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import commentCount16icon from 'svgs/icon/comment-16.svg';
import commentAnchor from 'svgs/icon/comment-anchor.svg';
import crossIcon from 'svgs/icon/cross.svg';
import cursor from 'svgs/icon/cursor.svg';
import dropdownMask from 'svgs/icon/dropdown-mask.svg';
import expandImage from 'svgs/icon/expand-image.svg';
import externalLink from 'svgs/icon/external-link.svg';
import marketDownIcon from 'svgs/icon/market-down.svg';
import marketSameIcon from 'svgs/icon/market-same.svg';
import marketUpIcon from 'svgs/icon/market-up.svg';
import marque36icon from 'svgs/icon/marque-36.svg';
import marque54icon from 'svgs/icon/marque-54.svg';
import plus from 'svgs/icon/plus.svg';
import quoteIcon from 'svgs/icon/quote.svg';
import reply from 'svgs/icon/reply.svg';
import shareEmail from 'svgs/icon/share-email.svg';
import shareFacebook from 'svgs/icon/share-facebook.svg';
import sharePinterest from 'svgs/icon/share-pinterest.svg';
import shareTwitter from 'svgs/icon/share-twitter.svg';
import share from 'svgs/icon/share.svg';
import star from 'svgs/icon/star.svg';
import tick from 'svgs/icon/tick.svg';
import glabsLogoSmall from 'svgs/logo/glabs-logo-small.svg';

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
    externalLink,
    tick,
    glabsLogoSmall,
    logomembership,
    star,
    chevronRight,
};

export const inlineSvg = (
    name: string,
    classes?: string[],
    title?: string
): string => addClassesAndTitle(svgs[name].markup, classes, title);
