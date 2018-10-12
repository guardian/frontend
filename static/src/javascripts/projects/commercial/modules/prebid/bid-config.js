// @flow strict

import config from 'lib/config';
import { pbTestNameMap } from 'lib/url';
import isEmpty from 'lodash/isEmpty';
import {
    buildAppNexusTargeting,
    buildPageTargeting,
    buildAppNexusTargetingObject,
} from 'common/modules/commercial/build-page-targeting';
import { commercialPrebidAdYouLike } from 'common/modules/experiments/tests/commercial-prebid-adyoulike';
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe';
import {
    getParticipations,
    getVariant,
    isInVariant,
} from 'common/modules/experiments/utils';
import type {
    PrebidAdYouLikeParams,
    PrebidAppNexusParams,
    PrebidBid,
    PrebidBidder,
    PrebidImproveParams,
    PrebidImproveSizeParam,
    PrebidIndexExchangeParams,
    PrebidOpenXParams,
    PrebidPubmaticParams,
    PrebidSize,
    PrebidSonobiParams,
    PrebidTrustXParams,
    PrebidXaxisParams,
} from './types';
import {
    getLargestSize,
    containsBillboard,
    containsDmpu,
    containsLeaderboard,
    containsLeaderboardOrBillboard,
    containsMpu,
    containsMpuOrDmpu,
    getBreakpointKey,
    shouldIncludeAdYouLike,
    shouldIncludeAppNexusAu,
    shouldIncludeAppNexusUkRow,
    shouldIncludeOpenx,
    shouldIncludeOzone,
    shouldIncludeTrustX,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
    isInUsRegion,
    isInAuRegion,
    stripDfpAdPrefixFrom,
} from './utils';

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
    } else {
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
    }
};

const getAppNexusInvCode = (sizes: Array<PrebidSize>): ?string => {
    const device: string = getBreakpointKey();
    const section: string = config.get('page.section', 'unknown');
    const slotSize: PrebidSize | null = getLargestSize(sizes);
    if (slotSize) {
        return `${device}${section.toLowerCase()}${slotSize.join('x')}`;
    }
};

const getAppNexusDirectPlacementIdUkRow = (sizes: PrebidSize[]): string => {
    const defaultPlacementId: string = '9251752';
    switch (getBreakpointKey()) {
        case 'D':
            if (containsMpuOrDmpu(sizes)) {
                return '9251752';
            }
            if (containsLeaderboardOrBillboard(sizes)) {
                return '9926678';
            }
            return defaultPlacementId;
        case 'M':
            if (containsMpu(sizes)) {
                return '4298191';
            }
            return defaultPlacementId;
        case 'T':
            if (containsMpu(sizes)) {
                return '11600568';
            }
            if (containsLeaderboard(sizes)) {
                return '11600778';
            }
            return defaultPlacementId;
        default:
            return defaultPlacementId;
    }
};

const getAppNexusBidParamsAu = (sizes: PrebidSize[]): PrebidAppNexusParams => {
    if (config.get('switches.prebidAppnexusInvcode', false)) {
        const invCode = getAppNexusInvCode(sizes);
        // flowlint sketchy-null-string:warn
        if (invCode) {
            return {
                invCode,
                member: '7012',
                keywords: buildAppNexusTargetingObject(buildPageTargeting()),
            };
        }
    }
    return {
        placementId: '11016434',
        keywords: buildAppNexusTargetingObject(buildPageTargeting()),
    };
};

const getAppNexusBidParamsUkRow = (
    sizes: PrebidSize[]
): PrebidAppNexusParams => ({
    placementId: getAppNexusDirectPlacementIdUkRow(sizes),
    keywords: buildAppNexusTargetingObject(buildPageTargeting()),
});

const getAppNexusPlacementId = (sizes: PrebidSize[]): string => {
    const defaultPlacementId: string = '13915593';
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
                    return defaultPlacementId;
                case 'M':
                    if (containsMpu(sizes)) {
                        return '13366904';
                    }
                    return defaultPlacementId;
                case 'T':
                    if (containsMpu(sizes)) {
                        return '13366913';
                    }
                    if (containsLeaderboard(sizes)) {
                        return '13366916';
                    }
                    return defaultPlacementId;
                default:
                    return defaultPlacementId;
            }
        default:
            return defaultPlacementId;
    }
};

const getAdYouLikePlacementId = (): string => {
    const test = commercialPrebidAdYouLike;
    const participations = getParticipations();
    const participation = participations ? participations[test.id] : {};
    const variant = participation
        ? getVariant(test, participation.variant)
        : {};
    return variant && variant.options ? variant.options.placementId : '';
};

// Improve has to have single size as parameter if slot doesn't accept multiple sizes,
// because it uses same placement ID for multiple slot sizes and has no other size information
const getImproveSizeParam = (slotId: string): PrebidImproveSizeParam => {
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

// Is pbtest being used?
const isPbTestOn = (): boolean => !isEmpty(pbTestNameMap());
// Helper for conditions
const inPbTestOr = (liveClause: boolean): boolean => isPbTestOn() || liveClause;

/* Bidders */
const appNexusBidderUkRow: PrebidBidder = {
    name: 'and-uk-row',
    switchName: 'prebidAppnexus',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidAppNexusParams =>
        getAppNexusBidParamsUkRow(sizes),
};

const appNexusBidderAu: PrebidBidder = {
    name: 'and-au',
    switchName: 'prebidAppnexus',
    bidParams: (slotId: string, sizes: PrebidSize[]): PrebidAppNexusParams =>
        getAppNexusBidParamsAu(sizes),
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

const adYouLikeBidder: PrebidBidder = {
    name: 'adyoulike',
    switchName: 'prebidAdYouLike',
    bidParams: (): PrebidAdYouLikeParams => ({
        placement: getAdYouLikePlacementId(),
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
                (() => {
                    switch (config.get('page.edition')) {
                        case 'UK':
                            return {
                                delDomain: 'guardian-d.openx.net',
                                unit: '539997090',
                                customParams: buildAppNexusTargetingObject(
                                    buildPageTargeting()
                                ),
                            };
                        case 'US':
                            return {
                                delDomain: 'guardian-us-d.openx.net',
                                unit: '539997087',
                                customParams: buildAppNexusTargetingObject(
                                    buildPageTargeting()
                                ),
                            };
                        default:
                            // AU and rest
                            return {
                                delDomain: 'guardian-aus-d.openx.net',
                                unit: '539997046',
                                customParams: buildAppNexusTargetingObject(
                                    buildPageTargeting()
                                ),
                            };
                    }
                })(),
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
        sonobiBidder,
        ...(inPbTestOr(shouldIncludeTrustX()) ? [trustXBidder] : []),
        ...(inPbTestOr(shouldIncludeAppNexusAu()) ? [appNexusBidderAu] : []),
        ...(inPbTestOr(shouldIncludeAppNexusUkRow())
            ? [appNexusBidderUkRow]
            : []),
        improveDigitalBidder,
        xaxisBidder,
        pubmaticBidder,
        ...(shouldIncludeAdYouLike(slotSizes) ? [adYouLikeBidder] : []),
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
    currentBidders(slotSizes).map((bidder: PrebidBidder) => {
        const bid: PrebidBid = {
            bidder: bidder.name,
            params: bidder.bidParams(slotId, slotSizes),
        };
        if (!isPbTestOn()) {
            // Label filtering only when not in test mode.
            if (bidder.labelAny) {
                bid.labelAny = bidder.labelAny;
            }
            if (bidder.labelAll) {
                bid.labelAll = bidder.labelAll;
            }
        }
        return bid;
    });

export const _ = {
    getAdYouLikePlacementId,
    getAppNexusInvCode,
    getAppNexusBidParamsUkRow,
    getAppNexusBidParamsAu,
    getAppNexusPlacementId,
    getDummyServerSideBidders,
    getIndexSiteId,
    getImprovePlacementId,
    getTrustXAdUnitId,
    indexExchangeBidders,
};
