// @flow strict

import config from 'lib/config';
import { pbTestNameMap } from 'lib/url';
import isEmpty from 'lodash/isEmpty';
import {
    buildAppNexusTargeting,
    buildAppNexusTargetingObject,
    getPageTargeting,
} from 'common/modules/commercial/build-page-targeting';
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe';
import { xaxisAdapterTest } from 'common/modules/experiments/tests/commercial-xaxis-adapter';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { isInUk,
    isInUsOrCa,
    isInAuOrNz,
    isInRow } from 'common/modules/commercial/geo-utils';
import type {
    PrebidAdYouLikeParams,
    PrebidAppNexusParams,
    PrebidBid,
    PrebidBidder,
    PrebidImproveParams,
    PrebidIndexExchangeParams,
    PrebidOpenXParams,
    PrebidOzoneParams,
    PrebidPubmaticParams,
    HeaderBiddingSize,
    PrebidSonobiParams,
    PrebidTripleLiftParams,
    PrebidTrustXParams,
    PrebidXaxisParams,
} from '../types';
import {
    containsBillboard,
    containsDmpu,
    containsLeaderboard,
    containsLeaderboardOrBillboard,
    containsMpu,
    containsMpuOrDmpu,
    containsMobileSticky,
    containsWS,
    getBreakpointKey,
    shouldIncludeAdYouLike,
    shouldIncludeAppNexus,
    shouldIncludeImproveDigital,
    shouldIncludeOpenx,
    shouldIncludeSonobi,
    shouldIncludeTrustX,
    shouldIncludeTripleLift,
    shouldIncludeXaxis,
    shouldUseOzoneAdaptor,
    shouldIncludePangaea,
    stripDfpAdPrefixFrom,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from '../utils';
import { getAppNexusDirectBidParams } from './appnexus';

const isInSafeframeTestVariant = (): boolean =>
    isInVariantSynchronous(commercialPrebidSafeframe, 'variant');

const isInXaxisAdapterTestVariant = (): boolean =>
    isInVariantSynchronous(xaxisAdapterTest, 'variant');

const isArticle = config.get('page.contentType') === 'Article';

const isDesktopAndArticle = getBreakpointKey() === 'D' && isArticle;

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
        case 'dfp-ad--mobile-sticky':
            return '8519';
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

const getImprovePlacementId = (sizes: HeaderBiddingSize[]): number => {
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
    if (isInUk()) {
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
    if (isInRow()) {
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

const getXhbPlacementId = (sizes: HeaderBiddingSize[]): number => {
    if (containsDmpu(sizes)) return 13663297;
    if (containsMpu(sizes)) return 13663304;
    if (containsBillboard(sizes)) return 13663284;
    return 13663304;
};

const getPangaeaPlacementIdForUsAndAu = (): string => {
    if (isInUsOrCa()) return '13892369';
    if (isInAuOrNz()) return '13892409';
    return '';
};

const getXaxisPlacementId = (sizes: HeaderBiddingSize[]): number => {
    const NO_MATCH_ID = 15900184;
    switch (getBreakpointKey()) {
        case 'D':
            if (containsMpu(sizes)) return 15900184;
            if (containsDmpu(sizes)) return 13663297;
            if (containsWS(sizes)) return 16279905;
            if (containsBillboard(sizes)) return 13663284;
            if (containsLeaderboard(sizes)) return 15900187;
            return NO_MATCH_ID;
        case 'M':
            if (containsMpu(sizes)) return 13663304;
            return NO_MATCH_ID;
        default:
            return NO_MATCH_ID;
    }
};

const getTripleLiftInventoryCode = (
    slotId: string,
    sizes: HeaderBiddingSize[]
): string => {
    if (containsLeaderboard(sizes))
        return 'theguardian_topbanner_728x90_prebid';

    if (containsMpu(sizes))
        return isArticle
            ? 'theguardian_article_300x250_prebid'
            : 'theguardian_sectionfront_300x250_prebid';

    if (containsMobileSticky(sizes)) return 'theguardian_320x50_HDX';

    console.log(`PREBID: Failed to get TripleLift ad unit for slot ${slotId}.`);
    return '';
};

// Is pbtest being used?
const isPbTestOn = (): boolean => !isEmpty(pbTestNameMap());
// Helper for conditions
const inPbTestOr = (liveClause: boolean): boolean => isPbTestOn() || liveClause;

/* Bidders */
const appNexusBidder: PrebidBidder = {
    name: 'and',
    switchName: 'prebidAppnexus',
    bidParams: (
        slotId: string,
        sizes: HeaderBiddingSize[]
    ): PrebidAppNexusParams => getAppNexusDirectBidParams(sizes),
};

const openxClientSideBidder: PrebidBidder = {
    name: 'oxd',
    switchName: 'prebidOpenx',
    bidParams: (): PrebidOpenXParams => {
        if (isInUsOrCa()) {
            return {
                delDomain: 'guardian-us-d.openx.net',
                unit: '540279544',
                customParams: buildAppNexusTargetingObject(getPageTargeting()),
            };
        }
        if (isInAuOrNz()) {
            return {
                delDomain: 'guardian-aus-d.openx.net',
                unit: '540279542',
                customParams: buildAppNexusTargetingObject(getPageTargeting()),
            };
        }
        // UK and ROW
        return {
            delDomain: 'guardian-d.openx.net',
            unit: '540279541',
            customParams: buildAppNexusTargetingObject(getPageTargeting()),
        };
    },
};

const ozoneClientSideBidder: PrebidBidder = {
    name: 'ozone',
    switchName: 'prebidOzone',
    bidParams: (): PrebidOzoneParams =>
        Object.assign(
            {},
            (() => ({
                publisherId: 'OZONEGMG0001',
                siteId: '4204204209',
                placementId: '0420420500',
                customData: [
                    {
                        settings: {},
                        targeting: buildAppNexusTargetingObject(getPageTargeting()),
                    },
                ],
                ozoneData: {}, // TODO: confirm if we need to send any
            }))(),
            window.OzoneLotameData ? { lotameData: window.OzoneLotameData } : {}
        ),
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
                appNexusTargeting: buildAppNexusTargeting(getPageTargeting()),
                pageViewId: config.get('ophan.pageViewId'),
            },
            isInSafeframeTestVariant() ? { render: 'safeframe' } : {}
        ),
};

const getPubmaticPublisherId = (): string => {
    if (isInUsOrCa()) {
        return '157206';
    }
    if (isInAuOrNz()) {
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

const tripleLiftBidder: PrebidBidder = {
    name: 'triplelift',
    switchName: 'prebidTriplelift',
    bidParams: (
        slotId: string,
        sizes: HeaderBiddingSize[]
    ): PrebidTripleLiftParams => ({
        inventoryCode: getTripleLiftInventoryCode(slotId, sizes),
    }),
};

const improveDigitalBidder: PrebidBidder = {
    name: 'improvedigital',
    switchName: 'prebidImproveDigital',
    bidParams: (
        slotId: string,
        sizes: HeaderBiddingSize[]
    ): PrebidImproveParams => ({
        placementId: getImprovePlacementId(sizes),
        size: getImproveSizeParam(slotId),
    }),
};

// Create multiple bids for each slot size
const xaxisBidders: (HeaderBiddingSize[]) => PrebidBidder[] = slotSizes =>
    slotSizes.map(size => ({
        name: 'xhb',
        switchName: 'prebidXaxis',
        bidParams: (): PrebidXaxisParams => ({
            placementId: getXaxisPlacementId([size]),
        }),
    }));

const xaxisBidder: PrebidBidder = {
    name: 'xhb',
    switchName: 'prebidXaxis',
    bidParams: (
        slotId: string,
        sizes: HeaderBiddingSize[]
    ): PrebidXaxisParams => ({
        placementId: getXhbPlacementId(sizes),
    }),
};

const adYouLikeBidder: PrebidBidder = {
    name: 'adyoulike',
    switchName: 'prebidAdYouLike',
    bidParams: (): PrebidAdYouLikeParams => {
        if (isInUk()) {
            return {
                placement: '2b4d757e0ec349583ce704699f1467dd',
            };
        }
        if (isInUsOrCa()) {
            return {
                placement: '7fdf0cd05e1d4bf39a2d3df9c61b3495',
            };
        }
        if (isInAuOrNz()) {
            return {
                placement: '5cf05e1705a2d57ba5d51e03f2af9208',
            };
        }
        // ROW
        return {
            placement: 'c1853ee8bfe0d4e935cbf2db9bb76a8b',
        };
    },
};

const pangaeaBidder: PrebidBidder = {
    name: 'pangaea',
    switchName: 'prebidPangaeaUsAu',
    bidParams: (): PrebidAppNexusParams =>
        Object.assign(
            {},
            {
                placementId: getPangaeaPlacementIdForUsAndAu(),
                keywords: buildAppNexusTargetingObject(getPageTargeting()),
            }
        ),
};

// There's an IX bidder for every size that the slot can take
const indexExchangeBidders: (
    HeaderBiddingSize[]
) => PrebidBidder[] = slotSizes => {
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

const currentBidders: (HeaderBiddingSize[]) => PrebidBidder[] = slotSizes => {
    const otherBidders: PrebidBidder[] = [
        ...(inPbTestOr(shouldIncludeSonobi()) ? [sonobiBidder] : []),
        ...(inPbTestOr(shouldIncludeTrustX()) ? [trustXBidder] : []),
        ...(inPbTestOr(shouldIncludePangaea()) ? [pangaeaBidder] : []),
        ...(inPbTestOr(shouldIncludeTripleLift()) ? [tripleLiftBidder] : []),
        ...(inPbTestOr(shouldIncludeAppNexus()) ? [appNexusBidder] : []),
        ...(inPbTestOr(shouldIncludeImproveDigital())
            ? [improveDigitalBidder]
            : []),
        pubmaticBidder,
        ...(!isInXaxisAdapterTestVariant() && inPbTestOr(shouldIncludeXaxis())
            ? [xaxisBidder]
            : []),
        ...(inPbTestOr(shouldIncludeAdYouLike(slotSizes))
            ? [adYouLikeBidder]
            : []),
        ...(inPbTestOr(shouldUseOzoneAdaptor()) ? [ozoneClientSideBidder] : []),
        ...(shouldIncludeOpenx() ? [openxClientSideBidder] : []),
    ];

    const xhbBidders =
        isInXaxisAdapterTestVariant() && inPbTestOr(shouldIncludeXaxis())
            ? xaxisBidders(slotSizes)
            : [];

    const allBidders = indexExchangeBidders(slotSizes)
        .concat(xhbBidders)
        .concat(otherBidders);
    return isPbTestOn()
        ? biddersBeingTested(allBidders)
        : biddersSwitchedOn(allBidders);
};

export const bids: (string, HeaderBiddingSize[]) => PrebidBid[] = (
    slotId,
    slotSizes
) =>
    currentBidders(slotSizes).map((bidder: PrebidBidder) => ({
        bidder: bidder.name,
        params: bidder.bidParams(slotId, slotSizes),
    }));

export const _ = {
    getIndexSiteId,
    getImprovePlacementId,
    getTrustXAdUnitId,
    indexExchangeBidders,
};
