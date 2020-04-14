// @flow strict

import once from 'lodash/once';
import { getBreakpoint, isBreakpoint } from 'lib/detect';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import config from 'lib/config';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { appnexusUSAdapter } from 'common/modules/experiments/tests/commercial-appnexus-us-adapter';
import { pangaeaAdapterTest } from 'common/modules/experiments/tests/commercial-pangaea-adapter';
import { commercialUkRowMobileSticky } from 'common/modules/experiments/tests/commercial-uk-row-mobile-sticky.js';
import type { HeaderBiddingSize } from './types';

const isInAppnexusUSAdapterTestVariant = (): boolean =>
    isInVariantSynchronous(appnexusUSAdapter, 'variant');

const SUFFIX_REGEXPS = {};
const stripSuffix = (s: string, suffix: string): string => {
    const re =
        SUFFIX_REGEXPS[suffix] ||
        (SUFFIX_REGEXPS[suffix] = new RegExp(`${suffix}$`));
    return s.replace(re, '');
};

const PREFIX_REGEXPS = {};
const stripPrefix = (s: string, prefix: string): string => {
    const re =
        PREFIX_REGEXPS[prefix] ||
        (PREFIX_REGEXPS[prefix] = new RegExp(`^${prefix}`));
    return s.replace(re, '');
};

const currentGeoLocation = once((): string => geolocationGetSync());

const contains = (
    sizes: HeaderBiddingSize[],
    size: HeaderBiddingSize
): boolean => Boolean(sizes.find(s => s[0] === size[0] && s[1] === size[1]));

export const removeFalseyValues = (o: {
    [string]: string,
}): { [string]: string } =>
    Object.keys(o).reduce((m: { [string]: string }, k: string) => {
        if (o[k]) {
            m[k] = o[k];
        }
        return m;
    }, {});

export const stripDfpAdPrefixFrom = (s: string): string =>
    stripPrefix(s, 'dfp-ad--');

export const isInUkRegion = (): boolean => currentGeoLocation() === 'GB';

export const isInUsRegion = (): boolean =>
    ['US', 'CA'].includes(currentGeoLocation());

export const isInAuRegion = (): boolean =>
    ['AU', 'NZ'].includes(currentGeoLocation());

export const isInRowRegion = (): boolean =>
    !isInUkRegion() && !isInUsRegion() && !isInAuRegion();

export const containsMpu = (sizes: HeaderBiddingSize[]): boolean =>
    contains(sizes, [300, 250]);

export const containsDmpu = (sizes: HeaderBiddingSize[]): boolean =>
    contains(sizes, [300, 600]);

export const containsLeaderboard = (sizes: HeaderBiddingSize[]): boolean =>
    contains(sizes, [728, 90]);

export const containsBillboard = (sizes: HeaderBiddingSize[]): boolean =>
    contains(sizes, [970, 250]);

export const containsMpuOrDmpu = (sizes: HeaderBiddingSize[]): boolean =>
    containsMpu(sizes) || containsDmpu(sizes);

export const containsMobileSticky = (sizes: HeaderBiddingSize[]): boolean =>
    contains(sizes, [320, 50]);

export const containsLeaderboardOrBillboard = (
    sizes: HeaderBiddingSize[]
): boolean => containsLeaderboard(sizes) || containsBillboard(sizes);

export const getLargestSize = (
    sizes: HeaderBiddingSize[]
): HeaderBiddingSize | null => {
    const reducer = (
        previous: HeaderBiddingSize,
        current: HeaderBiddingSize
    ) => {
        if (previous[0] >= current[0] && previous[1] >= current[1]) {
            return previous;
        }
        return current;
    };
    return sizes.length > 0 ? sizes.reduce(reducer) : null;
};

export const getBreakpointKey = (): string => {
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
    minimum: number,
    maximum: number
): number => {
    const min = Math.ceil(minimum);
    const max = Math.floor(maximum);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shouldIncludeSonobi = (): boolean => isInUsRegion();

export const shouldIncludeOpenx = (): boolean => !isInUsRegion();

export const shouldIncludeTrustX = (): boolean => isInUsRegion();

export const shouldIncludePangaea = (): boolean =>
    isInVariantSynchronous(pangaeaAdapterTest, 'variant');

export const shouldIncludeTripleLift = (): boolean => isInUsRegion();

export const shouldIncludeAdYouLike = (
    slotSizes: HeaderBiddingSize[]
): boolean => containsMpu(slotSizes);

// TODO: Check is we want regional restrictions on where we load the ozoneBidAdapter
export const shouldUseOzoneAdaptor = (): boolean =>
    !isInUsRegion() && !isInAuRegion() && config.get('switches.prebidOzone');

export const shouldIncludeAppNexus = (): boolean =>
    isInAppnexusUSAdapterTestVariant() || !isInUsRegion();

export const shouldIncludeXaxis = (): boolean =>
    // 10% of UK page views
    isInUkRegion() &&
    (config.get('page.isDev', true) || getRandomIntInclusive(1, 10) === 1);

export const shouldIncludeImproveDigital = (): boolean =>
    isInUkRegion() || isInRowRegion();

export const shouldIncludeMobileSticky = once(
    (): boolean =>
        window.location.hash.indexOf('#mobile-sticky') !== -1 ||
        (config.get('switches.mobileStickyLeaderboard') &&
            isBreakpoint({ min: 'mobile', max: 'mobileLandscape' }) &&
            (isInUsRegion() ||
                isInAuRegion() ||
                isInVariantSynchronous(
                    commercialUkRowMobileSticky,
                    'ukVariant'
                ) ||
                isInVariantSynchronous(
                    commercialUkRowMobileSticky,
                    'rowVariant'
                )) &&
            config.get('page.contentType') === 'Article' &&
            !config.get('page.isHosted'))
);

export const stripMobileSuffix = (s: string): string =>
    stripSuffix(stripSuffix(s, '--mobile'), 'Mobile');

export const stripTrailingNumbersAbove1 = (s: string): string =>
    stripSuffix(s, '([2-9]|\\d{2,})');

export const containsWS = (sizes: HeaderBiddingSize[]): boolean =>
    contains(sizes, [160, 600]);

export const shouldIncludeOnlyA9 =
    window.location.hash.indexOf('#only-a9') !== -1;
