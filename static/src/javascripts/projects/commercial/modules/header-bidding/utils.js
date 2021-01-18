

import once from 'lodash/once';
import { getBreakpoint, isBreakpoint } from 'lib/detect';
import config from 'lib/config';
import { isInAuOrNz, isInRow, isInUk, isInUsOrCa } from "common/modules/commercial/geo-utils";
import { pbTestNameMap } from 'lib/url';

const SUFFIX_REGEXPS = {};
const stripSuffix = (s, suffix) => {
    const re =
        SUFFIX_REGEXPS[suffix] ||
        (SUFFIX_REGEXPS[suffix] = new RegExp(`${suffix}$`));
    return s.replace(re, '');
};

const PREFIX_REGEXPS = {};
const stripPrefix = (s, prefix) => {
    const re =
        PREFIX_REGEXPS[prefix] ||
        (PREFIX_REGEXPS[prefix] = new RegExp(`^${prefix}`));
    return s.replace(re, '');
};

const contains = (
    sizes,
    size
) => Boolean(sizes.find(s => s[0] === size[0] && s[1] === size[1]));

export const removeFalseyValues = (o) =>
    Object.keys(o).reduce((m, k) => {
        if (o[k]) {
            m[k] = o[k];
        }
        return m;
    }, {});

export const stripDfpAdPrefixFrom = (s) =>
    stripPrefix(s, 'dfp-ad--');

export const containsMpu = (sizes) =>
    contains(sizes, [300, 250]);

export const containsDmpu = (sizes) =>
    contains(sizes, [300, 600]);

export const containsLeaderboard = (sizes) =>
    contains(sizes, [728, 90]);

export const containsBillboard = (sizes) =>
    contains(sizes, [970, 250]);

export const containsMpuOrDmpu = (sizes) =>
    containsMpu(sizes) || containsDmpu(sizes);

export const containsMobileSticky = (sizes) =>
    contains(sizes, [320, 50]);

export const containsLeaderboardOrBillboard = (
    sizes
) => containsLeaderboard(sizes) || containsBillboard(sizes);

export const getLargestSize = (
    sizes
) => {
    const reducer = (
        previous,
        current
    ) => {
        if (previous[0] >= current[0] && previous[1] >= current[1]) {
            return previous;
        }
        return current;
    };
    return sizes.length > 0 ? sizes.reduce(reducer) : null;
};

export const getBreakpointKey = () => {
    switch (getBreakpoint()) {
        case 'mobile':
        case 'mobileMedium':
        case 'mobileLandscape':
            return 'M';
        case 'phablet':
        case 'tablet':
            return 'T';
        case 'desktop':
        case 'leftCol':
        case 'wide':
            return 'D';
        default:
            return 'M';
    }
};

export const getRandomIntInclusive = (
    minimum,
    maximum
) => {
    const min = Math.ceil(minimum);
    const max = Math.floor(maximum);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shouldIncludeSonobi = () => isInUsOrCa();

export const shouldIncludeOpenx = () => !isInUsOrCa();

export const shouldIncludeTrustX = () => isInUsOrCa();

export const shouldIncludeTripleLift = () => isInUsOrCa();

export const shouldIncludeAdYouLike = (
    slotSizes
) => containsMpu(slotSizes);

// TODO: Check is we want regional restrictions on where we load the ozoneBidAdapter
export const shouldUseOzoneAdaptor = () =>
    !isInUsOrCa() && !isInAuOrNz() && config.get('switches.prebidOzone');

export const shouldIncludeAppNexus = () =>
    isInAuOrNz() ||
    ((config.get('switches.prebidAppnexusUkRow') && !isInUsOrCa()) ||
        !!pbTestNameMap().and);

export const shouldIncludeXaxis = () =>
    // 10% of UK page views
    isInUk() &&
    (config.get('page.isDev', true) || getRandomIntInclusive(1, 10) === 1);

export const shouldIncludeImproveDigital = () =>
    isInUk() || isInRow();

export const shouldIncludeMobileSticky = once(
    () =>
        window.location.hash.indexOf('#mobile-sticky') !== -1 ||
        (config.get('switches.mobileStickyLeaderboard') &&
            isBreakpoint({ min: 'mobile', max: 'mobileLandscape' }) &&
            (isInUsOrCa() || isInAuOrNz()) &&
            config.get('page.contentType') === 'Article' &&
            !config.get('page.isHosted'))
);

export const stripMobileSuffix = (s) =>
    stripSuffix(stripSuffix(s, '--mobile'), 'Mobile');

export const stripTrailingNumbersAbove1 = (s) =>
    stripSuffix(s, '([2-9]|\\d{2,})');

export const containsWS = (sizes) =>
    contains(sizes, [160, 600]);

export const shouldIncludeOnlyA9 =
    window.location.hash.indexOf('#only-a9') !== -1;
