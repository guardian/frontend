// @flow

import config from 'lib/config';
import { getTestVariantId } from 'common/modules/experiments/utils.js';
import memoize from 'lodash/functions/memoize';
import isEmpty from 'lodash/objects/isEmpty';

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
    isExcludedGeolocation,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from 'commercial/modules/prebid/utils';

const isDesktopArticle =
    getBreakpointKey() === 'D' && config.get('page.contentType') === 'Article';

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
    const site = config
        .get('page.pbIndexSites')
        .find(s => s.bp === getBreakpointKey());
    return site && site.id ? site.id.toString() : '';
};

const contains = (sizes: PrebidSize[], size: PrebidSize): boolean =>
    Boolean(sizes.find(s => s[0] === size[0] && s[1] === size[1]));

const containsMpu = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [300, 250]);

const containsDmpu = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [300, 600]);

const containsLeaderboard = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [728, 90]);

const containsBillboard = (sizes: PrebidSize[]): boolean =>
    contains(sizes, [970, 250]);

const containsMpuOrDmpu = (sizes: PrebidSize[]): boolean =>
    containsMpu(sizes) || containsDmpu(sizes);

const containsLeaderboardOrBillboard = (sizes: PrebidSize[]): boolean =>
    containsLeaderboard(sizes) || containsBillboard(sizes);

const getImprovePlacementId = (sizes: PrebidSize[]): number => {
    switch (config.get('page.edition')) {
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
    switch (config.get('page.edition')) {
        case 'UK':
            switch (getBreakpointKey()) {
                case 'D':
                    if (containsMpuOrDmpu(sizes)) {
                        return '13366606';
                    }
                    if (containsLeaderboardOrBillboard(sizes)) {
                        return '13366615';
                    }
                    return '13144370';
                case 'M':
                    if (containsMpu(sizes)) {
                        return '13366904';
                    }
                    return '13144370';
                case 'T':
                    if (containsMpu(sizes)) {
                        return '13366913';
                    }
                    if (containsLeaderboard(sizes)) {
                        return '13366916';
                    }
                    return '13144370';
                default:
                    return '13144370';
            }
        default:
            return '13144370';
    }
};

// Improve has to have single size as parameter if slot doesn't accept multiple sizes,
// because it uses same placement ID for multiple slot sizes and has no other size information
const getImproveSizeParam = (slotId: string): PrebidImproveSizeParam => {
    const key = stripTrailingNumbersAbove1(stripMobileSuffix(slotId));
    return key &&
        (key.endsWith('mostpop') ||
            key.endsWith('comments') ||
            key.endsWith('inline1') ||
            (key.endsWith('inline') && !isDesktopArticle))
        ? { w: 300, h: 250 }
        : {};
};

const getXaxisPlacementId = (sizes: PrebidSize[]): number => {
    if (containsDmpu(sizes)) return 13663297;
    if (containsMpu(sizes)) return 13663304;
    if (containsBillboard(sizes)) return 13663284;
    return 13663304;
};

const sonobiBidder: PrebidBidder = {
    name: 'sonobi',
    switchName: 'prebidSonobi',
    bidParams: (slotId: string): PrebidSonobiParams =>
        Object.assign(
            {},
            {
                ad_unit: config.get('page.adUnit'),
                dom_id: slotId,
                appNexusTargeting: buildAppNexusTargeting(buildPageTargeting()),
                pageViewId: config.get('ophan.pageViewId'),
            },
            getTestVariantId('CommercialPrebidSafeframe') === 'variant'
                ? { render: 'safeframe' }
                : {}
        ),
};

const trustXBidder: PrebidBidder = {
    name: 'trustx',
    switchName: 'prebidTrustx',
    bidParams: (slotId: string): PrebidTrustXParams => ({
        uid: getTrustXAdUnitId(slotId),
    }),
    labelAll: ['geo-NA'],
};

const improveDigitalBidder: PrebidBidder = {
    name: 'improvedigital',
    switchName: 'prebidImproveDigital',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidImproveParams => ({
        placementId: getImprovePlacementId(sizes),
        size: getImproveSizeParam(slotId),
    }),
    labelAny: ['edn-UK', 'edn-INT'],
};

const xaxisBidder: PrebidBidder = {
    name: 'xhb',
    switchName: 'prebidXaxis',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidXaxisParams => ({
        placementId: getXaxisPlacementId(sizes),
    }),
    labelAll: ['edn-UK', 'deal-FirstLook'],
};

// Dummy bidders for the whitehorse project (https://trello.com/c/KbeBLyYZ)
const getDummyServerSideBidders = (): Array<PrebidBidder> => {
    const dummyServerSideBidders: Array<PrebidBidder> = [];

    const appnexusBidder: PrebidBidder = {
        name: 'appnexus',
        switchName: 'prebidS2sozone',
        bidParams: (
            slotId: string,
            sizes: PrebidSize[]
        ): PrebidAppNexusParams => ({
            placementId: getAppNexusPlacementId(sizes),
            customData: buildAppNexusTargeting(buildPageTargeting()), // Ok to duplicate call. Lodash 'once' is used.
        }),
    };

    const openxBidder: PrebidBidder = {
        name: 'openx',
        switchName: 'prebidS2sozone',
        bidParams: (): PrebidOpenXParams => {
            switch (config.get('page.edition')) {
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

    // Experimental. Only 0.01% of the PVs.
    if (
        config.get('switches.prebidS2sozone') &&
        getRandomIntInclusive(1, 10000) === 1
    ) {
        dummyServerSideBidders.push(openxBidder);
        if (!isExcludedGeolocation()) {
            dummyServerSideBidders.push(appnexusBidder);
        }
    }
    return dummyServerSideBidders;
};

// There's an IX bidder for every size that the slot can take
const indexExchangeBidders: (PrebidSize[]) => PrebidBidder[] = slotSizes => {
    const indexSiteId = getIndexSiteId();
    return slotSizes.map(size => ({
        name: 'ix',
        switchName: 'prebidIndexExchange',
        bidParams: (): PrebidIndexExchangeParams => ({
            siteId: indexSiteId,
            size,
        }),
    }));
};

const otherBidders: PrebidBidder[] = [
    sonobiBidder,
    trustXBidder,
    improveDigitalBidder,
    xaxisBidder,
];

// Returns a map { <bidderName>: true } of bidders
// according to the pbtest URL parameter
const pbTestNameMap = memoize(
    (): Object =>
        new URLSearchParams(window.location.search)
            .getAll('pbtest')
            .reduce((acc, value) => {
                acc[value] = true;
                return acc;
            }, {}),
    (): String =>
        // Same implicit parameter as the memoized function
        window.location.search
);
// Is pbtest being used?
const isPbTestOn = (): Boolean => !isEmpty(pbTestNameMap());

const biddersBeingTested: (PrebidBidder[]) => PrebidBidder[] = allBidders =>
    allBidders.filter(bidder => pbTestNameMap()[bidder.name]);

const biddersSwitchedOn: (PrebidBidder[]) => PrebidBidder[] = allBidders => {
    const isSwitchedOn: PrebidBidder => boolean = bidder =>
        config.get(`switches.${bidder.switchName}`);
    return allBidders.filter(bidder => isSwitchedOn(bidder));
};

const currentBidders: (PrebidSize[]) => PrebidBidder[] = slotSizes => {
    const allBidders = indexExchangeBidders(slotSizes)
        .concat(otherBidders)
        .concat(getDummyServerSideBidders());
    return isPbTestOn()
        ? biddersBeingTested(allBidders)
        : biddersSwitchedOn(allBidders);
};

export const bids: (string, PrebidSize[]) => PrebidBid[] = (
    slotId,
    slotSizes
) =>
    currentBidders(slotSizes).map((bidder: PrebidBidder) => {
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

export const _ = { getDummyServerSideBidders };
