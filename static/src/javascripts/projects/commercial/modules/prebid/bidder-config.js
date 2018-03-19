// @flow

import config from 'lib/config';
import {
    buildAppNexusTargeting,
    buildPageTargeting,
} from 'common/modules/commercial/build-page-targeting';
import type {
    PrebidBidder,
    PrebidImproveParams,
    PrebidImproveSizeParam,
    PrebidIndexExchangeParams,
    PrebidSize,
    PrebidSonobiParams,
    PrebidTrustXParams,
    PrebidXaxisParams,
} from 'commercial/modules/prebid/types';
import {
    getBreakpointKey,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from 'commercial/modules/prebid/utils';

const getTrustXAdUnitId = (slotId: string): string => {
    switch (stripTrailingNumbersAbove1(stripMobileSuffix(slotId))) {
        case 'dfp-ad--inline1':
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
const getImproveSizeParam = (slotId: string): PrebidImproveSizeParam => {
    const key = stripTrailingNumbersAbove1(stripMobileSuffix(slotId));
    const isInlineNotDesktopArticle =
        key.endsWith('inline') &&
        !(getBreakpointKey() === 'D' && config.page.contentType === 'Article');
    return key.endsWith('mostpop') ||
        key.endsWith('inline1') ||
        isInlineNotDesktopArticle
        ? { w: 300, h: 250 }
        : {};
};

const sonobiBidder: PrebidBidder = {
    name: 'sonobi',
    bidParams: (slotId: string): PrebidSonobiParams => ({
        ad_unit: config.page.adUnit,
        dom_id: slotId,
        floor: 0.5,
        appNexusTargeting: buildAppNexusTargeting(buildPageTargeting()),
        pageViewId: config.ophan.pageViewId,
    }),
};

const indexExchangeBidder: PrebidBidder = {
    name: 'indexExchange',
    bidParams: (): PrebidIndexExchangeParams => ({
        id: '185406',
        siteID: getIndexSiteId(),
    }),
};

const trustXBidder: PrebidBidder = {
    name: 'trustx',
    bidParams: (slotId: string): PrebidTrustXParams => ({
        uid: getTrustXAdUnitId(slotId),
    }),
    labelAll: ['geo-NA'],
};

const improveDigitalBidder: PrebidBidder = {
    name: 'improvedigital',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidImproveParams => ({
        placementId: getImprovePlacementId(sizes),
        size: getImproveSizeParam(slotId),
    }),
    labelAny: ['edn-UK', 'edn-INT'],
};

const xaxisBidder: PrebidBidder = {
    name: 'appnexus',
    bidParams: (): PrebidXaxisParams => ({
        placementId: 12984524,
    }),
    labelAll: ['edn-UK'],
};

const bidders: PrebidBidder[] = [];
if (config.switches.prebidSonobi) {
    bidders.push(sonobiBidder);
}
if (config.switches.prebidIndexExchange) {
    bidders.push(indexExchangeBidder);
}
if (config.switches.prebidTrustx) {
    bidders.push(trustXBidder);
}
if (config.switches.prebidImproveDigital) {
    bidders.push(improveDigitalBidder);
}
if (config.switches.prebidXaxis) {
    bidders.push(xaxisBidder);
}

export { bidders };
