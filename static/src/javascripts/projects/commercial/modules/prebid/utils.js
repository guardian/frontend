// @flow strict

import once from 'lodash/once';
import { getBreakpoint, isBreakpoint } from 'lib/detect';
import { pbTestNameMap } from 'lib/url';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import config from 'lib/config';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { prebidTripleLiftAdapter } from 'common/modules/experiments/tests/prebid-triple-lift-adapter';
import { pangaeaAdapterTest } from 'common/modules/experiments/tests/commercial-pangaea-adapter';
import type { PrebidSize } from './types';

const stripSuffix = (s: string, suffix: string): string => {
    const re = new RegExp(`${suffix}$`);
    return s.replace(re, '');
};

const currentGeoLocation = once((): string => geolocationGetSync());

const contains = (sizes: PrebidSize[], size: PrebidSize): boolean =>
    Boolean(sizes.find(s => s[0] === size[0] && s[1] === size[1]));

const stripPrefix = (s: string, prefix: string): string => {
    const re = new RegExp(`^${prefix}`);
    return s.replace(re, '');
};

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

export const containsMpu = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [300, 250]);

export const containsDmpu = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [300, 600]);

export const containsLeaderboard = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [728, 90]);

export const containsBillboard = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [970, 250]);

export const containsMpuOrDmpu = (sizes: PrebidSize[]): boolean =>
    containsMpu(sizes) || containsDmpu(sizes);

export const containsMobileSticky = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [320, 50]);

export const containsLeaderboardOrBillboard = (sizes: PrebidSize[]): boolean =>
    containsLeaderboard(sizes) || containsBillboard(sizes);

export const getLargestSize = (sizes: PrebidSize[]): PrebidSize | null => {
    const reducer = (previous: PrebidSize, current: PrebidSize) => {
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

export const shouldIncludeTripleLift = (): boolean =>
    isInVariantSynchronous(prebidTripleLiftAdapter, 'variant');

export const shouldIncludeAdYouLike = (slotSizes: PrebidSize[]): boolean =>
    containsMpu(slotSizes);

export const shouldIncludeOzone = (): boolean =>
    !isInUsRegion() && !isInAuRegion();

// TODO: Check is we want regional restrictions on where we load the ozoneBidAdapter
export const shouldUseOzoneAdaptor = (): boolean =>
    !isInUsRegion() && !isInAuRegion() && config.get('switches.prebidOzone');

export const shouldIncludeAppNexus = (): boolean =>
    isInAuRegion() ||
    ((config.get('switches.prebidAppnexusUkRow') && !isInUsRegion()) ||
        !!pbTestNameMap().and);

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
            isInUsRegion() &&
            config.get('page.contentType') === 'Article')
);

export const stripMobileSuffix = (s: string): string =>
    stripSuffix(s, '--mobile');

export const stripTrailingNumbersAbove1 = (s: string): string =>
    stripSuffix(s, '([2-9]|\\d{2,})');

export const containsWS = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [160, 600]);
