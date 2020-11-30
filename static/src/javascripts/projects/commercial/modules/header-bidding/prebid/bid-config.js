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
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import {
    isInUk,
    isInUsOrCa,
    isInAuOrNz,
    isInRow,
} from 'common/modules/commercial/geo-utils';
import { getLotameData } from '@guardian/commercial-core';
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
    stripDfpAdPrefixFrom,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from '../utils';
import { getAppNexusDirectBidParams } from './appnexus';

// The below line is needed for page skins to show

const isInSafeframeTestVariant = (): boolean =>
    isInVariantSynchronous(commercialPrebidSafeframe, 'variant');

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

const getXaxisPlacementId = (sizes: HeaderBiddingSize[]): number => {
    if (containsDmpu(sizes)) return 13663297;
    if (containsMpu(sizes)) return 13663304;
    if (containsBillboard(sizes)) return 13663284;
    return 13663304;
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

const getOzoneTargeting = async (): Promise<{}> => {
    const lotameData = getLotameData();
    const appNexusTargetingObject = buildAppNexusTargetingObject(
        await getPageTargeting()
    );
    if (typeof lotameData !== 'undefined') {
        return {
            ...appNexusTargetingObject,
            lotameSegs: lotameData.ozoneLotameData,
            lotamePid: lotameData.ozoneLotameProfileId,
        };
    }
    return appNexusTargetingObject;
};

// Is pbtest being used?
const isPbTestOn = (): boolean => !isEmpty(pbTestNameMap());
// Helper for conditions
const inPbTestOr = (liveClause: boolean): boolean => isPbTestOn() || liveClause;

/* Bidders */
const appNexusBidder: PrebidBidder = {
    name: 'and',
    switchName: 'prebidAppnexus',
    bidParams: async (
        slotId: string,
        sizes: HeaderBiddingSize[]
    ): Promise<PrebidAppNexusParams> => getAppNexusDirectBidParams(sizes),
};

const openxClientSideBidder: PrebidBidder = {
    name: 'oxd',
    switchName: 'prebidOpenx',
    bidParams: async (): Promise<PrebidOpenXParams> => {
        if (isInUsOrCa()) {
            return {
                delDomain: 'guardian-us-d.openx.net',
                unit: '540279544',
                customParams: buildAppNexusTargetingObject(
                    await getPageTargeting()
                ),
            };
        }
        if (isInAuOrNz()) {
            return {
                delDomain: 'guardian-aus-d.openx.net',
                unit: '540279542',
                customParams: buildAppNexusTargetingObject(
                    await getPageTargeting()
                ),
            };
        }
        // UK and ROW
        return {
            delDomain: 'guardian-d.openx.net',
            unit: '540279541',
            customParams: buildAppNexusTargetingObject(
                await getPageTargeting()
            ),
        };
    },
};

const ozoneClientSideBidder: PrebidBidder = {
    name: 'ozone',
    switchName: 'prebidOzone',
    bidParams: async (): Promise<PrebidOzoneParams> =>
        Promise.resolve(
            Object.assign(
                {},
                (async () => ({
                    publisherId: 'OZONEGMG0001',
                    siteId: '4204204209',
                    placementId: '0420420500',
                    customData: [
                        {
                            settings: {},
                            targeting: await getOzoneTargeting(),
                        },
                    ],
                    ozoneData: {}, // TODO: confirm if we need to send any
                }))()
            )
        ),
};

const sonobiBidder: PrebidBidder = {
    name: 'sonobi',
    switchName: 'prebidSonobi',
    bidParams: async (slotId: string): Promise<PrebidSonobiParams> =>
        Promise.resolve(
            Object.assign(
                {},
                {
                    ad_unit: config.get('page.adUnit'),
                    dom_id: slotId,
                    appNexusTargeting: buildAppNexusTargeting(
                        await getPageTargeting()
                    ),
                    pageViewId: config.get('ophan.pageViewId'),
                },
                isInSafeframeTestVariant() ? { render: 'safeframe' } : {}
            )
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
    bidParams: (slotId: string): Promise<PrebidPubmaticParams> =>
        Promise.resolve(
            Object.assign(
                {},
                {
                    publisherId: getPubmaticPublisherId(),
                    adSlot: stripDfpAdPrefixFrom(slotId),
                }
            )
        ),
};

const trustXBidder: PrebidBidder = {
    name: 'trustx',
    switchName: 'prebidTrustx',
    bidParams: (slotId: string): Promise<PrebidTrustXParams> =>
        Promise.resolve({
            uid: getTrustXAdUnitId(slotId, isDesktopAndArticle),
        }),
};

const tripleLiftBidder: PrebidBidder = {
    name: 'triplelift',
    switchName: 'prebidTriplelift',
    bidParams: (
        slotId: string,
        sizes: HeaderBiddingSize[]
    ): Promise<PrebidTripleLiftParams> =>
        Promise.resolve({
            inventoryCode: getTripleLiftInventoryCode(slotId, sizes),
        }),
};

const improveDigitalBidder: PrebidBidder = {
    name: 'improvedigital',
    switchName: 'prebidImproveDigital',
    bidParams: (
        slotId: string,
        sizes: HeaderBiddingSize[]
    ): Promise<PrebidImproveParams> =>
        Promise.resolve({
            placementId: getImprovePlacementId(sizes),
            size: getImproveSizeParam(slotId),
        }),
};

const xaxisBidder: PrebidBidder = {
    name: 'xhb',
    switchName: 'prebidXaxis',
    bidParams: (
        slotId: string,
        sizes: HeaderBiddingSize[]
    ): Promise<PrebidXaxisParams> =>
        Promise.resolve({
            placementId: getXaxisPlacementId(sizes),
        }),
};

const adYouLikeBidder: PrebidBidder = {
    name: 'adyoulike',
    switchName: 'prebidAdYouLike',
    bidParams: (): Promise<PrebidAdYouLikeParams> => {
        if (isInUk()) {
            return Promise.resolve({
                placement: '2b4d757e0ec349583ce704699f1467dd',
            });
        }
        if (isInUsOrCa()) {
            return Promise.resolve({
                placement: '7fdf0cd05e1d4bf39a2d3df9c61b3495',
            });
        }
        if (isInAuOrNz()) {
            return Promise.resolve({
                placement: '5cf05e1705a2d57ba5d51e03f2af9208',
            });
        }
        // ROW
        return Promise.resolve({
            placement: 'c1853ee8bfe0d4e935cbf2db9bb76a8b',
        });
    },
};

// There's an IX bidder for every size that the slot can take
const indexExchangeBidders: (
    HeaderBiddingSize[]
) => PrebidBidder[] = slotSizes => {
    const indexSiteId = getIndexSiteId();
    return slotSizes.map(size => ({
        name: 'ix',
        switchName: 'prebidIndexExchange',
        bidParams: (): Promise<PrebidIndexExchangeParams> =>
            Promise.resolve({
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

const currentBidders: (
    HeaderBiddingSize[]
) => Promise<PrebidBidder[]> = async slotSizes => {
    const otherBidders: PrebidBidder[] = [
        ...(inPbTestOr(shouldIncludeSonobi()) ? [sonobiBidder] : []),
        ...(inPbTestOr(shouldIncludeTrustX()) ? [trustXBidder] : []),
        ...(inPbTestOr(shouldIncludeTripleLift()) ? [tripleLiftBidder] : []),
        ...(inPbTestOr(shouldIncludeAppNexus()) ? [appNexusBidder] : []),
        ...(inPbTestOr(shouldIncludeImproveDigital())
            ? [improveDigitalBidder]
            : []),
        ...(inPbTestOr(shouldIncludeXaxis()) ? [xaxisBidder] : []),
        pubmaticBidder,
        ...(inPbTestOr(shouldIncludeAdYouLike(slotSizes))
            ? [adYouLikeBidder]
            : []),
        ...(inPbTestOr(shouldUseOzoneAdaptor()) ? [ozoneClientSideBidder] : []),
        ...(shouldIncludeOpenx() ? [openxClientSideBidder] : []),
    ];

    const allBidders = indexExchangeBidders(slotSizes).concat(otherBidders);
    return isPbTestOn()
        ? biddersBeingTested(allBidders)
        : biddersSwitchedOn(allBidders);
};

export const bids: (
    string,
    HeaderBiddingSize[]
) => Promise<PrebidBid[]> = async (slotId, slotSizes) => {
    const currentBiddersAsync = await currentBidders(slotSizes);
    return Promise.all(
        currentBiddersAsync.map(async (bidder: PrebidBidder) => ({
            bidder: bidder.name,
            params: await bidder.bidParams(slotId, slotSizes),
        }))
    );
};

export const _ = {
    getIndexSiteId,
    getImprovePlacementId,
    getTrustXAdUnitId,
    indexExchangeBidders,
};
