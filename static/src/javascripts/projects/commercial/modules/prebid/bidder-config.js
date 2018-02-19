// @flow

import config from 'lib/config';
import { getBreakpoint } from 'lib/detect';
import {
    buildAppNexusTargeting,
    buildPageTargeting,
} from 'common/modules/commercial/build-page-targeting';
import type {
    PrebidBidder,
    PrebidBidderCriteria,
    PrebidImproveParams,
    PrebidImproveSizeParam,
    PrebidIndexExchangeParams,
    PrebidSize,
    PrebidSonobiParams,
    PrebidTrustXParams,
} from 'commercial/modules/prebid/types';

const getTrustXAdUnitId = (slotId: string): string => {
    const slotIdStripTrailingNumbers = slotId.replace(/\d+$/, '');
    switch (slotIdStripTrailingNumbers) {
        case 'dfp-ad--inline':
            return '2960';
        case 'dfp-ad--mostpop':
            return '2961';
        case 'dfp-ad--right':
            return '2962';
        case 'dfp-ad--top-above-nav':
            return '2963';
        default:
            console.log(
                `PREBID: Failed to get TrustX ad unit for slot ${slotId}.`
            );
            return '';
    }
};

const getBreakpointKey = (): string => {
    switch (getBreakpoint()) {
        case 'mobile':
        case 'mobileMedium':
        case 'mobileLandscape':
        case 'phablet':
            return 'M';
        case 'tablet':
            return 'T';
        case 'desktop':
        case 'leftCol':
        case 'wide':
            return 'D';
        default:
            return 'D';
    }
};

const getIndexSiteId = (): string => {
    const site = config.page.pbIndexSites.find(
        s => s.bp === getBreakpointKey()
    );
    return site ? site.id : '';
};

const contains = (sizes: PrebidSize[], size: PrebidSize): boolean =>
    Boolean(sizes.find(s => s[0] === size[0] && s[1] === size[1]));

const containsMpuOrDmpu = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [300, 250]) || contains(sizes, [300, 600]);

const containsLeaderboardOrBillboard = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [728, 90]) || contains(sizes, [970, 250]);

const getTestImprovePlacementId = (sizes: PrebidSize[]): number => {
    if (containsMpuOrDmpu(sizes)) {
        return 1116414;
    }
    if (containsLeaderboardOrBillboard(sizes)) {
        return 1116415;
    }
    return -1;
};

const getImprovePlacementId = (sizes: PrebidSize[]): number => {
    switch (config.page.edition) {
        case 'UK':
            switch (getBreakpointKey()) {
                case 'D':
                    if (containsMpuOrDmpu(sizes)) {
                        return 1116396;
                    }
                    if (containsLeaderboardOrBillboard(sizes)) {
                        return 1116397;
                    }
                    return -1;
                case 'M':
                    if (containsMpuOrDmpu(sizes)) {
                        return 1116400;
                    }
                    return -1;
                case 'T':
                    if (containsMpuOrDmpu(sizes)) {
                        return 1116398;
                    }
                    if (containsLeaderboardOrBillboard(sizes)) {
                        return 1116399;
                    }
                    return -1;
                default:
                    return -1;
            }
        case 'INT':
            switch (getBreakpointKey()) {
                case 'D':
                    if (containsMpuOrDmpu(sizes)) {
                        return 1116420;
                    }
                    if (containsLeaderboardOrBillboard(sizes)) {
                        return 1116421;
                    }
                    return -1;
                case 'M':
                    if (containsMpuOrDmpu(sizes)) {
                        return 1116424;
                    }
                    return -1;
                case 'T':
                    if (containsMpuOrDmpu(sizes)) {
                        return 1116422;
                    }
                    if (containsLeaderboardOrBillboard(sizes)) {
                        return 1116423;
                    }
                    return -1;
                default:
                    return -1;
            }
        default:
            return -1;
    }
};

// Improve has to have single size as parameter if slot doesn't accept multiple sizes,
// because it uses same placement ID for multiple slot sizes and has no other size information
const getImproveSizeParam = (slotId: string): PrebidImproveSizeParam =>
    slotId === 'dfp-ad--mostpop' || slotId.startsWith('dfp-ad--inline')
        ? { w: 300, h: 250 }
        : {};

export const bidderConfig: PrebidBidderCriteria = {
    sonobi: [
        {
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250]],
            slots: ['dfp-ad--inline', 'dfp-ad--mostpop'],
        },
        {
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250], [300, 600]],
            slots: ['dfp-ad--right'],
        },
        {
            breakpoint: { min: 'desktop' },
            sizes: [[728, 90], [970, 250]],
            slots: ['dfp-ad--top-above-nav'],
        },
    ],
    indexExchange: [
        {
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250]],
            slots: ['dfp-ad--inline', 'dfp-ad--mostpop'],
        },
        {
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250], [300, 600]],
            slots: ['dfp-ad--right'],
        },
        {
            breakpoint: { min: 'desktop' },
            sizes: [[728, 90], [970, 250]],
            slots: ['dfp-ad--top-above-nav'],
        },
    ],
    trustx: [
        {
            geoContinent: 'NA', // North America
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250]],
            slots: ['dfp-ad--inline', 'dfp-ad--mostpop'],
        },
        {
            geoContinent: 'NA', // North America
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250], [300, 600]],
            slots: ['dfp-ad--right'],
        },
        {
            geoContinent: 'NA', // North America
            breakpoint: { min: 'desktop' },
            sizes: [[728, 90], [970, 250]],
            slots: ['dfp-ad--top-above-nav'],
        },
    ],
    improvedigital: [
        {
            editions: ['UK', 'INT'],
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250]],
            slots: ['dfp-ad--inline', 'dfp-ad--mostpop'],
        },
        {
            editions: ['UK', 'INT'],
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250], [300, 600]],
            slots: ['dfp-ad--right'],
        },
        {
            editions: ['UK', 'INT'],
            breakpoint: { min: 'desktop' },
            sizes: [[728, 90], [970, 250]],
            slots: ['dfp-ad--top-above-nav'],
        },
    ],
};

export const sonobiBidder: PrebidBidder = {
    name: 'sonobi',
    bidParams: (slotId: string): PrebidSonobiParams => ({
        ad_unit: config.page.adUnit,
        dom_id: slotId,
        floor: 0.5,
        appNexusTargeting: buildAppNexusTargeting(buildPageTargeting()),
        pageViewId: config.ophan.pageViewId,
    }),
};

export const indexExchangeBidder: PrebidBidder = {
    name: 'indexExchange',
    bidParams: (): PrebidIndexExchangeParams => ({
        id: '185406',
        siteID: getIndexSiteId(),
    }),
};

export const trustXBidder: PrebidBidder = {
    name: 'trustx',
    bidParams: (slotId: string): PrebidTrustXParams => ({
        uid: getTrustXAdUnitId(slotId),
    }),
};

export const improveDigitalBidder: PrebidBidder = {
    name: 'improvedigital',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidImproveParams => ({
        placementId: config.switches.testImproveBidder
            ? getTestImprovePlacementId(sizes)
            : getImprovePlacementId(sizes),
        size: getImproveSizeParam(slotId),
    }),
};
