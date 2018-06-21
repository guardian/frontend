// @flow

import config from 'lib/config';
import {
    buildAppNexusTargeting,
    buildPageTargeting,
} from 'common/modules/commercial/build-page-targeting';
import type {
    PrebidBid,
    PrebidBidder,
    PrebidImproveParams,
    PrebidImproveSizeParam,
    PrebidIndexExchangeParams,
    PrebidSize,
    PrebidSonobiParams,
    PrebidTrustXParams,
    PrebidXaxisParams,
    PrebidAppNexusParams,
    PrebidOpenXParams,
} from 'commercial/modules/prebid/types';
import {
    getBreakpointKey,
    getRandomIntInclusive,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from 'commercial/modules/prebid/utils';

const isDesktopArticle =
    getBreakpointKey() === 'D' && config.page.contentType === 'Article';

const getTrustXAdUnitId = (slotId: string): string => {
    switch (stripMobileSuffix(slotId)) {
        case 'dfp-ad--inline1':
            return '2960';
        case 'dfp-ad--inline2':
            if (isDesktopArticle) return '3826';
            return '3827';
        case 'dfp-ad--inline3':
            if (isDesktopArticle) return '3828';
            return '3829';
        case 'dfp-ad--inline4':
            if (isDesktopArticle) return '3830';
            return '3831';
        case 'dfp-ad--inline5':
            if (isDesktopArticle) return '3832';
            return '3833';
        case 'dfp-ad--inline6':
            if (isDesktopArticle) return '3834';
            return '3835';
        case 'dfp-ad--inline7':
            if (isDesktopArticle) return '3836';
            return '3837';
        case 'dfp-ad--inline8':
            if (isDesktopArticle) return '3838';
            return '3839';
        case 'dfp-ad--inline9':
            if (isDesktopArticle) return '3840';
            return '3841';
        case 'dfp-ad--mostpop':
            return '2961';
        case 'dfp-ad--right':
            return '2962';
        case 'dfp-ad--top-above-nav':
            return '2963';
        case 'dfp-ad--comments':
            return '3840';
        default:
            // for inline10 and onwards just use same IDs as inline9
            if (slotId.startsWith('dfp-ad--inline')) {
                if (isDesktopArticle) return '3840';
                return '3841';
            }
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
    return site && site.id ? site.id.toString() : '';
};

const contains = (sizes: PrebidSize[], size: PrebidSize): boolean =>
    Boolean(sizes.find(s => s[0] === size[0] && s[1] === size[1]));

const containsMpu = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [300, 250]);

const containsDmpu = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [300, 600]);

const containsMpuOrDmpu = (sizes: PrebidSize[]): boolean =>
    containsMpu(sizes) || containsDmpu(sizes);

const containsLeaderboard = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [728, 90]);

const containsLeaderboardOrBillboard = (sizes: PrebidSize[]): boolean =>
    containsLeaderboard(sizes) || contains(sizes, [970, 250]);

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

const getAppNexusPlacementId = (sizes: PrebidSize[]): string => {
    switch (config.page.edition) {
        case 'UK':
            switch (getBreakpointKey()) {
                case 'D':
                    if (containsMpuOrDmpu(sizes)) {
                        return '13366606';
                    }
                    if (containsLeaderboardOrBillboard(sizes)) {
                        return '13366615';
                    }
                    return '';
                case 'M':
                    if (containsMpu(sizes)) {
                        return '13366904';
                    }
                    return '';
                case 'T':
                    if (containsMpu(sizes)) {
                        return '13366913';
                    }
                    if (containsLeaderboard(sizes)) {
                        return '13366916';
                    }
                    return '';
                default:
                    return '';
            }
        default:
            return '';
    }
};

// Improve has to have single size as parameter if slot doesn't accept multiple sizes,
// because it uses same placement ID for multiple slot sizes and has no other size information
const getImproveSizeParam = (slotId: string): PrebidImproveSizeParam => {
    const key = stripTrailingNumbersAbove1(stripMobileSuffix(slotId));
    return key.endsWith('mostpop') ||
        key.endsWith('comments') ||
        key.endsWith('inline1') ||
        (key.endsWith('inline') && !isDesktopArticle)
        ? { w: 300, h: 250 }
        : {};
};

const getXaxisPlacementId = (sizes: PrebidSize[]): number => {
    if (contains(sizes, [970, 250])) return 13218365;
    if (contains(sizes, [300, 600])) return 12984524;
    return 13218372;
};

const sonobiBidder: PrebidBidder = {
    name: 'sonobi',
    bidParams: (slotId: string): PrebidSonobiParams => ({
        ad_unit: config.page.adUnit,
        dom_id: slotId,
        appNexusTargeting: buildAppNexusTargeting(buildPageTargeting()),
        pageViewId: config.ophan.pageViewId,
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
    name: 'xhb',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidXaxisParams => ({
        placementId: getXaxisPlacementId(sizes),
    }),
    labelAll: ['edn-UK', 'deal-FirstLook'],
};

// Dummy bidders for the whitehorse project (https://trello.com/c/KbeBLyYZ)
const appnexusBidder: PrebidBidder = {
    name: 'appnexus',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidAppNexusParams => ({
        placementId: getAppNexusPlacementId(sizes),
    }),
};

const openxBidder: PrebidBidder = {
    name: 'openx',
    bidParams: (): PrebidOpenXParams => {
        switch (config.page.edition) {
            case 'UK':
                return {
                    delDomain: 'guardian-d.openx.net',
                    unit: '539997090',
                };
            case 'US':
                return {
                    delDomain: 'guardian-us-d.openx.net',
                    unit: '539997087',
                };
            default:
                // AU and rest
                return {
                    delDomain: 'guardian-aus-d.openx.net',
                    unit: '539997046',
                };
        }
    },
};

const dummyServerSideBidders: PrebidBidder[] = [];

// Experimental. Only 0.01% of the PVs.
if (config.switches.prebidS2sozone && getRandomIntInclusive(1, 10000) === 1) {
    dummyServerSideBidders.push(appnexusBidder);
    dummyServerSideBidders.push(openxBidder);
}

// End of dummy serverside bidders

// There's an IX bidder for every size that the slot can take
const indexExchangeBidders: (PrebidSize[]) => PrebidBidder[] = slotSizes => {
    if (config.switches.prebidIndexExchange) {
        const indexSiteId = getIndexSiteId();
        return slotSizes.map(size => ({
            name: 'ix',
            bidParams: (): PrebidIndexExchangeParams => ({
                siteId: indexSiteId,
                size,
            }),
        }));
    }
    return [];
};

const otherBidders: PrebidBidder[] = [];
if (config.switches.prebidSonobi) {
    otherBidders.push(sonobiBidder);
}
if (config.switches.prebidTrustx) {
    otherBidders.push(trustXBidder);
}
if (config.switches.prebidImproveDigital) {
    otherBidders.push(improveDigitalBidder);
}
if (config.switches.prebidXaxis) {
    otherBidders.push(xaxisBidder);
}

const bidders: (PrebidSize[]) => PrebidBidder[] = slotSizes => {
    let combinedBidders = otherBidders.slice();
    combinedBidders = combinedBidders.concat(indexExchangeBidders(slotSizes));
    combinedBidders = combinedBidders.concat(dummyServerSideBidders);
    return combinedBidders;
};

export const bids: (string, PrebidSize[]) => PrebidBid[] = (
    slotId,
    slotSizes
) =>
    bidders(slotSizes).map((bidder: PrebidBidder) => {
        const bid: PrebidBid = {
            bidder: bidder.name,
            params: bidder.bidParams(slotId, slotSizes),
        };
        if (bidder.labelAny) {
            bid.labelAny = bidder.labelAny;
        }
        if (bidder.labelAll) {
            bid.labelAll = bidder.labelAll;
        }
        return bid;
    });
