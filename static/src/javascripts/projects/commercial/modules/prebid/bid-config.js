// @flow strict

import config from 'lib/config';
import { pbTestNameMap } from 'lib/url';
import isEmpty from 'lodash/isEmpty';
import {
    buildAppNexusTargeting,
    buildAppNexusTargetingObject,
    buildPageTargeting,
} from 'common/modules/commercial/build-page-targeting';
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe';
import { getVariant, isInVariant } from 'common/modules/experiments/utils';
import type {
    PrebidAdYouLikeParams,
    PrebidAppNexusParams,
    PrebidBid,
    PrebidBidder,
    PrebidImproveParams,
    PrebidIndexExchangeParams,
    PrebidOpenXParams,
    PrebidPubmaticParams,
    PrebidSize,
    PrebidSonobiParams,
    PrebidTrustXParams,
    PrebidXaxisParams,
} from './types';
import {
    containsBillboard,
    containsDmpu,
    containsLeaderboard,
    containsLeaderboardOrBillboard,
    containsMpu,
    containsMpuOrDmpu,
    getBreakpointKey,
    isInAuRegion,
    isInRowRegion,
    isInUkRegion,
    isInUsRegion,
    shouldIncludeAdYouLike,
    shouldIncludeAppNexus,
    shouldIncludeImproveDigital,
    shouldIncludeOpenx,
    shouldIncludeOzone,
    shouldIncludeSonobi,
    shouldIncludeTrustX,
    shouldIncludeXaxis,
    stripDfpAdPrefixFrom,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from './utils';
import { getAppNexusDirectBidParams, getAppNexusPlacementId } from './appnexus';

const isInSafeframeTestVariant = (): boolean => {
    const variant = getVariant(commercialPrebidSafeframe, 'variant');
    return variant ? isInVariant(commercialPrebidSafeframe, variant) : false;
};

const isDesktopAndArticle =
    getBreakpointKey() === 'D' && config.get('page.contentType') === 'Article';

const getTrustXAdUnitId = (
    slotId: string,
    isDesktopArticle: boolean
): string => {
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
            // eslint-disable-next-line no-console
            console.log(
                `PREBID: Failed to get TrustX ad unit for slot ${slotId}.`
            );
            return '';
    }
};

const getIndexSiteId = (): string => {
    if (isInSafeframeTestVariant()) {
        switch (getBreakpointKey()) {
            case 'D':
                return '287246';
            case 'T':
                return '287247';
            case 'M':
                return '287248';
            default:
                return '-1';
        }
    } else {
        const site = config
            .get('page.pbIndexSites', [])
            .find(s => s.bp === getBreakpointKey());
        return site && site.id ? site.id.toString() : '';
    }
};

const getImprovePlacementId = (sizes: PrebidSize[]): number => {
    if (isInSafeframeTestVariant()) {
        switch (getBreakpointKey()) {
            case 'D':
                if (containsDmpu(sizes)) {
                    return 1116408;
                }
                if (containsMpu(sizes)) {
                    return 1116407;
                }
                if (containsLeaderboardOrBillboard(sizes)) {
                    return 1116409;
                }
                return -1;
            case 'T':
                if (containsMpu(sizes)) {
                    return 1116410;
                }
                if (containsLeaderboard(sizes)) {
                    return 1116411;
                }
                return -1;
            case 'M':
                return 1116412;
            default:
                return -1;
        }
    }
    if (isInUkRegion()) {
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
    }
    if (isInRowRegion()) {
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
    }
    return -1;
};

// Improve has to have single size as parameter if slot doesn't accept multiple sizes,
// because it uses same placement ID for multiple slot sizes and has no other size information
const getImproveSizeParam = (slotId: string): { w?: number, h?: number } => {
    const key = stripTrailingNumbersAbove1(stripMobileSuffix(slotId));
    return key &&
        (key.endsWith('mostpop') ||
            key.endsWith('comments') ||
            key.endsWith('inline1') ||
            (key.endsWith('inline') && !isDesktopAndArticle))
        ? { w: 300, h: 250 }
        : {};
};

const getXaxisPlacementId = (sizes: PrebidSize[]): number => {
    if (containsDmpu(sizes)) return 13663297;
    if (containsMpu(sizes)) return 13663304;
    if (containsBillboard(sizes)) return 13663284;
    return 13663304;
};

const getPangaeaPlacementId = (sizes: PrebidSize[]): number => {
    type PangaeaSection = {
        sections: Array<string>,
        lb: number,
        mmpu: number,
        dmpu: number,
    };
    const pangaeaList: Array<PangaeaSection> = [
        {
            sections: ['business'],
            lb: 13892359,
            mmpu: 13892404,
            dmpu: 13892360,
        },
        {
            sections: ['culture'],
            lb: 13892361,
            mmpu: 13892405,
            dmpu: 13892362,
        },
        {
            sections: ['uk', 'us', 'au'],
            lb: 13892363,
            mmpu: 13892406,
            dmpu: 13892364,
        },
        {
            sections: ['news'],
            lb: 13892365,
            mmpu: 13892407,
            dmpu: 13892366,
        },
        {
            sections: ['money'],
            lb: 13892367,
            mmpu: 13892408,
            dmpu: 13892368,
        },
        {
            sections: ['sport'],
            lb: 13892372,
            mmpu: 13892410,
            dmpu: 13892373,
        },
        {
            sections: ['lifeandstyle', 'fashion'],
            lb: 13892411,
            mmpu: 13892436,
            dmpu: 13892437,
        },
        {
            sections: ['technology', 'environment'],
            lb: 13892376,
            mmpu: 13892414,
            dmpu: 13892377,
        },
        {
            sections: ['travel'],
            lb: 13892378,
            mmpu: 13892415,
            dmpu: 13892379,
        },
    ];

    const section: string = config.get('page.section', '').toLowerCase();
    const placementIdsForSection: PangaeaSection = pangaeaList.find(
        ({ sections }) => sections.includes(section)
    ) || {
        sections: ['other'],
        lb: 13892369,
        mmpu: 13892409,
        dmpu: 13892370,
    };

    const breakpointKey: string = getBreakpointKey();
    // Mobile MPU
    if (containsMpu(sizes) && breakpointKey === 'M')
        return placementIdsForSection.mmpu;
    // Double/Single MPU
    if (containsMpuOrDmpu(sizes)) return placementIdsForSection.dmpu;
    // Leaderboard/Billboard
    if (containsLeaderboardOrBillboard(sizes)) return placementIdsForSection.lb;
    return 13892409; // Other Section MPU as fallback
};

// Is pbtest being used?
const isPbTestOn = (): boolean => !isEmpty(pbTestNameMap());
// Helper for conditions
const inPbTestOr = (liveClause: boolean): boolean => isPbTestOn() || liveClause;

/* Bidders */
const appNexusBidder: PrebidBidder = {
    name: 'and',
    switchName: 'prebidAppnexus',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidAppNexusParams =>
        getAppNexusDirectBidParams(sizes, isInAuRegion()),
};

const openxClientSideBidder: PrebidBidder = {
    name: 'oxd',
    switchName: 'prebidOpenx',
    bidParams: (): PrebidOpenXParams => {
        switch (config.get('page.edition')) {
            case 'US':
                return {
                    delDomain: 'guardian-us-d.openx.net',
                    unit: '540279544',
                    customParams: buildAppNexusTargetingObject(
                        buildPageTargeting()
                    ),
                };
            case 'AU':
                return {
                    delDomain: 'guardian-aus-d.openx.net',
                    unit: '540279542',
                    customParams: buildAppNexusTargetingObject(
                        buildPageTargeting()
                    ),
                };
            default:
                // UK and ROW
                return {
                    delDomain: 'guardian-d.openx.net',
                    unit: '540279541',
                    customParams: buildAppNexusTargetingObject(
                        buildPageTargeting()
                    ),
                };
        }
    },
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
            isInSafeframeTestVariant() ? { render: 'safeframe' } : {}
        ),
};

const getPubmaticPublisherId = (): string => {
    if (isInUsRegion()) {
        return '157206';
    }
    if (isInAuRegion()) {
        return '157203';
    }
    return '157207';
};

const pubmaticBidder: PrebidBidder = {
    name: 'pubmatic',
    switchName: 'prebidPubmatic',
    bidParams: (slotId: string): PrebidPubmaticParams =>
        Object.assign(
            {},
            {
                publisherId: getPubmaticPublisherId(),
                adSlot: stripDfpAdPrefixFrom(slotId),
            }
        ),
};

const trustXBidder: PrebidBidder = {
    name: 'trustx',
    switchName: 'prebidTrustx',
    bidParams: (slotId: string): PrebidTrustXParams => ({
        uid: getTrustXAdUnitId(slotId, isDesktopAndArticle),
    }),
};

const improveDigitalBidder: PrebidBidder = {
    name: 'improvedigital',
    switchName: 'prebidImproveDigital',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidImproveParams => ({
        placementId: getImprovePlacementId(sizes),
        size: getImproveSizeParam(slotId),
    }),
};

const xaxisBidder: PrebidBidder = {
    name: 'xhb',
    switchName: 'prebidXaxis',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidXaxisParams => ({
        placementId: getXaxisPlacementId(sizes),
    }),
};

const adYouLikeBidder: PrebidBidder = {
    name: 'adyoulike',
    switchName: 'prebidAdYouLike',
    bidParams: (): PrebidAdYouLikeParams => ({
        placement: '2b4d757e0ec349583ce704699f1467dd',
    }),
};

// Dummy bidders for the whitehorse project (https://trello.com/c/KbeBLyYZ)
const getDummyServerSideBidders = (): Array<PrebidBidder> => {
    const dummyServerSideBidders: Array<PrebidBidder> = [];

    const appnexusServerSideBidder: PrebidBidder = {
        name: 'appnexus',
        switchName: 'prebidS2sozone',
        bidParams: (
            slotId: string,
            sizes: PrebidSize[]
        ): PrebidAppNexusParams =>
            Object.assign(
                {},
                {
                    placementId: getAppNexusPlacementId(sizes),
                    keywords: buildAppNexusTargetingObject(
                        buildPageTargeting()
                    ), // Ok to duplicate call. Lodash 'once' is used.
                },
                window.OzoneLotameData ? { lotame: window.OzoneLotameData } : {}
            ),
    };

    const openxServerSideBidder: PrebidBidder = {
        name: 'openx',
        switchName: 'prebidS2sozone',
        bidParams: (): PrebidOpenXParams =>
            Object.assign(
                {},
                (() => ({
                    delDomain: 'guardian-d.openx.net',
                    unit: '539997090',
                    customParams: buildAppNexusTargetingObject(
                        buildPageTargeting()
                    ),
                }))(),
                window.OzoneLotameData ? { lotame: window.OzoneLotameData } : {}
            ),
    };

    const pangaeaServerSideBidder: PrebidBidder = {
        name: 'pangaea',
        switchName: 'prebidS2sozone',
        bidParams: (
            slotId: string,
            sizes: PrebidSize[]
        ): PrebidAppNexusParams =>
            Object.assign(
                {},
                {
                    placementId: getPangaeaPlacementId(sizes).toString(),
                    keywords: buildAppNexusTargetingObject(
                        buildPageTargeting()
                    ), // Ok to duplicate call. Lodash 'once' is used.
                },
                window.OzoneLotameData ? { lotame: window.OzoneLotameData } : {}
            ),
    };

    if (
        inPbTestOr(
            config.get('switches.prebidS2sozone') && shouldIncludeOzone()
        )
    ) {
        dummyServerSideBidders.push(openxServerSideBidder);
        dummyServerSideBidders.push(appnexusServerSideBidder);
        dummyServerSideBidders.push(pangaeaServerSideBidder);
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

const biddersBeingTested: (PrebidBidder[]) => PrebidBidder[] = allBidders =>
    allBidders.filter(bidder => pbTestNameMap()[bidder.name]);

const biddersSwitchedOn: (PrebidBidder[]) => PrebidBidder[] = allBidders => {
    const isSwitchedOn: PrebidBidder => boolean = bidder =>
        config.get(`switches.${bidder.switchName}`);
    return allBidders.filter(bidder => isSwitchedOn(bidder));
};

const currentBidders: (PrebidSize[]) => PrebidBidder[] = slotSizes => {
    const otherBidders: PrebidBidder[] = [
        ...(inPbTestOr(shouldIncludeSonobi()) ? [sonobiBidder] : []),
        ...(inPbTestOr(shouldIncludeTrustX()) ? [trustXBidder] : []),
        ...(inPbTestOr(shouldIncludeAppNexus()) ? [appNexusBidder] : []),
        ...(inPbTestOr(shouldIncludeImproveDigital())
            ? [improveDigitalBidder]
            : []),
        ...(inPbTestOr(shouldIncludeXaxis()) ? [xaxisBidder] : []),
        pubmaticBidder,
        ...(inPbTestOr(shouldIncludeAdYouLike(slotSizes))
            ? [adYouLikeBidder]
            : []),
        ...(shouldIncludeOpenx() ? [openxClientSideBidder] : []),
    ];

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
    currentBidders(slotSizes).map((bidder: PrebidBidder) => ({
        bidder: bidder.name,
        params: bidder.bidParams(slotId, slotSizes),
    }));

export const _ = {
    getDummyServerSideBidders,
    getIndexSiteId,
    getImprovePlacementId,
    getTrustXAdUnitId,
    indexExchangeBidders,
};
