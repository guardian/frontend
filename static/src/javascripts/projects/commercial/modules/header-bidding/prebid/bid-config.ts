import { log } from '@guardian/libs';
import config from '../../../../../lib/config';
import { pbTestNameMap } from '../../../../../lib/url';
import type { PageTargeting } from '../../../../common/modules/commercial/build-page-targeting';
import {
	buildAppNexusTargeting,
	buildAppNexusTargetingObject,
} from '../../../../common/modules/commercial/build-page-targeting';
import {
	isInAuOrNz,
	isInRow,
	isInUk,
	isInUsa,
	isInUsOrCa,
} from '../../../../common/modules/commercial/geo-utils';
import {
	containsLeaderboard,
	containsLeaderboardOrBillboard,
	containsMobileSticky,
	containsMpu,
	containsMpuOrDmpu,
	getBreakpointKey,
	shouldIncludeAdYouLike,
	shouldIncludeAppNexus,
	shouldIncludeCriteo,
	shouldIncludeImproveDigital,
	shouldIncludeImproveDigitalSkin,
	shouldIncludeOpenx,
	shouldIncludeSmart,
	shouldIncludeSonobi,
	shouldIncludeTripleLift,
	shouldIncludeTrustX,
	shouldIncludeXaxis,
	shouldUseOzoneAdaptor,
	stripDfpAdPrefixFrom,
	stripMobileSuffix,
	stripTrailingNumbersAbove1,
} from '../utils';
import { getAppNexusDirectBidParams } from './appnexus';

const isArticle = config.get('page.contentType') === 'Article';

const isDesktopAndArticle = getBreakpointKey() === 'D' && isArticle;

const getTrustXAdUnitId = (
	slotId: string,
	isDesktopArticle: boolean,
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
			log(
				'commercial',
				`PREBID: Failed to get TrustX ad unit for slot ${slotId}.`,
			);
			return '';
	}
};

const getIndexSiteId = (): string => {
	const site = window.guardian.config.page.pbIndexSites.find(
		(s: PrebidIndexSite) => s.bp === getBreakpointKey(),
	);
	return site?.id ? site.id.toString() : '';
};

const getImprovePlacementId = (sizes: HeaderBiddingSize[]): number => {
	if (isInUk()) {
		switch (getBreakpointKey()) {
			case 'D': // Desktop
				if (containsMpuOrDmpu(sizes)) {
					return 1116396;
				}
				if (containsLeaderboardOrBillboard(sizes)) {
					return 1116397;
				}
				return -1;
			case 'M': // Mobile
				if (containsMpuOrDmpu(sizes)) {
					return 1116400;
				}
				return -1;
			case 'T': // Tablet
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
			case 'D': // Desktop
				if (containsMpuOrDmpu(sizes)) {
					return 1116420;
				}
				if (containsLeaderboardOrBillboard(sizes)) {
					return 1116421;
				}
				return -1;
			case 'M': // Mobile
				if (containsMpuOrDmpu(sizes)) {
					return 1116424;
				}
				return -1;
			case 'T': // Tablet
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

const getImproveSkinPlacementId = (): number => {
	if (isInUk()) {
		switch (getBreakpointKey()) {
			case 'D': // Desktop
				return 22526482;
			default:
				return -1;
		}
	}
	if (isInRow()) {
		switch (getBreakpointKey()) {
			case 'D': // Desktop
				return 22526483;
			default:
				return -1;
		}
	}
	return -1;
};

// Improve has to have single size as parameter if slot doesn't accept multiple sizes,
// because it uses same placement ID for multiple slot sizes and has no other size information
const getImproveSizeParam = (
	slotId: string,
): {
	w?: number;
	h?: number;
} => {
	const key = stripTrailingNumbersAbove1(stripMobileSuffix(slotId));
	return key &&
		(key.endsWith('mostpop') ||
			key.endsWith('comments') ||
			key.endsWith('inline1') ||
			(key.endsWith('inline') && !isDesktopAndArticle))
		? {
				w: 300,
				h: 250,
		  }
		: {};
};

const getXaxisPlacementId = (sizes: HeaderBiddingSize[]): number => {
	switch (getBreakpointKey()) {
		case 'D':
			if (containsMpuOrDmpu(sizes)) {
				return 20943665;
			}
			if (containsLeaderboardOrBillboard(sizes)) {
				return 20943666;
			}
			return 20943668;
		case 'M':
			if (containsMpuOrDmpu(sizes)) {
				return 20943669;
			}
			return 20943670;
		case 'T':
			if (containsMpuOrDmpu(sizes)) {
				return 20943671;
			}
			if (containsLeaderboardOrBillboard(sizes)) {
				return 20943672;
			}
			return 20943674;
		default:
			return -1;
	}
};

const getTripleLiftInventoryCode = (
	slotId: string,
	sizes: HeaderBiddingSize[],
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
const isPbTestOn = () => Object.keys(pbTestNameMap()).length > 0;
// Helper for conditions
const inPbTestOr = (liveClause: boolean) => isPbTestOn() || liveClause;

/* Bidders */
const appNexusBidder: (pageTargeting: PageTargeting) => PrebidBidder = (
	pageTargeting: PageTargeting,
) => ({
	name: 'and',
	switchName: 'prebidAppnexus',
	bidParams: (
		slotId: string,
		sizes: HeaderBiddingSize[],
	): PrebidAppNexusParams => getAppNexusDirectBidParams(sizes, pageTargeting),
});

const openxClientSideBidder: (pageTargeting: PageTargeting) => PrebidBidder = (
	pageTargeting: PageTargeting,
) => ({
	name: 'oxd',
	switchName: 'prebidOpenx',
	bidParams: (): PrebidOpenXParams => {
		if (isInUsOrCa()) {
			return {
				delDomain: 'guardian-us-d.openx.net',
				unit: '540279544',
				customParams: buildAppNexusTargetingObject(pageTargeting),
			};
		}
		if (isInAuOrNz()) {
			return {
				delDomain: 'guardian-aus-d.openx.net',
				unit: '540279542',
				customParams: buildAppNexusTargetingObject(pageTargeting),
			};
		}
		// UK and ROW
		return {
			delDomain: 'guardian-d.openx.net',
			unit: '540279541',
			customParams: buildAppNexusTargetingObject(pageTargeting),
		};
	},
});

const getOzonePlacementId = () => (isInUsa() ? '1420436308' : '0420420500');

const ozoneClientSideBidder: (pageTargeting: PageTargeting) => PrebidBidder = (
	pageTargeting: PageTargeting,
) => ({
	name: 'ozone',
	switchName: 'prebidOzone',
	bidParams: (): PrebidOzoneParams => ({
		publisherId: 'OZONEGMG0001',
		siteId: '4204204209',
		placementId: getOzonePlacementId(),
		customData: [
			{
				settings: {},
				targeting: buildAppNexusTargetingObject(pageTargeting),
			},
		],
		ozoneData: {}, // TODO: confirm if we need to send any
	}),
});

const sonobiBidder: (pageTargeting: PageTargeting) => PrebidBidder = (
	pageTargeting: PageTargeting,
) => ({
	name: 'sonobi',
	switchName: 'prebidSonobi',
	bidParams: (slotId: string): PrebidSonobiParams => ({
		ad_unit: window.guardian.config.page.adUnit,
		dom_id: slotId,
		appNexusTargeting: buildAppNexusTargeting(pageTargeting),
		pageViewId: window.guardian.ophan.pageViewId,
	}),
});

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
	bidParams: (slotId: string): PrebidPubmaticParams => ({
		publisherId: getPubmaticPublisherId(),
		adSlot: stripDfpAdPrefixFrom(slotId),
	}),
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
		sizes: HeaderBiddingSize[],
	): PrebidTripleLiftParams => ({
		inventoryCode: getTripleLiftInventoryCode(slotId, sizes),
	}),
};

const improveDigitalBidder: PrebidBidder = {
	name: 'improvedigital',
	switchName: 'prebidImproveDigital',
	bidParams: (
		slotId: string,
		sizes: HeaderBiddingSize[],
	): PrebidImproveParams => ({
		placementId: getImprovePlacementId(sizes),
		size: getImproveSizeParam(slotId),
	}),
};

const improveDigitalSkinBidder: PrebidBidder = {
	name: 'improvedigital',
	switchName: 'prebidImproveDigitalSkins',
	bidParams: (): PrebidImproveParams => ({
		placementId: getImproveSkinPlacementId(),
		size: {},
	}),
};

const xaxisBidder: PrebidBidder = {
	name: 'xhb',
	switchName: 'prebidXaxis',
	bidParams: (
		slotId: string,
		sizes: HeaderBiddingSize[],
	): PrebidXaxisParams => ({
		placementId: getXaxisPlacementId(sizes),
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

const criteoBidder: PrebidBidder = {
	name: 'criteo',
	switchName: 'prebidCriteo',
	bidParams: () => ({
		networkId: 337,
	}),
};

const smartBidder: PrebidBidder = {
	name: 'smartadserver',
	switchName: 'prebidSmart',
	bidParams: () => ({
		siteId: 465656,
		pageId: 1472549,
		formatId: 105870,
	}),
};

// There's an IX bidder for every size that the slot can take
const indexExchangeBidders = (
	slotSizes: HeaderBiddingSize[],
): PrebidBidder[] => {
	const indexSiteId = getIndexSiteId();
	return slotSizes.map((size) => ({
		name: 'ix',
		switchName: 'prebidIndexExchange',
		bidParams: (): PrebidIndexExchangeParams => ({
			siteId: indexSiteId,
			size,
		}),
	}));
};

const biddersBeingTested = (allBidders: PrebidBidder[]): PrebidBidder[] =>
	allBidders.filter((bidder) => pbTestNameMap()[bidder.name]);

const biddersSwitchedOn = (allBidders: PrebidBidder[]): PrebidBidder[] => {
	const isSwitchedOn = (bidder: PrebidBidder): boolean =>
		window.guardian.config.switches[bidder.switchName] ?? false;

	return allBidders.filter((bidder) => isSwitchedOn(bidder));
};

const currentBidders = (
	slotSizes: HeaderBiddingSize[],
	pageTargeting: PageTargeting,
): PrebidBidder[] => {
	const biddersToCheck: Array<[boolean, PrebidBidder]> = [
		[shouldIncludeCriteo(), criteoBidder],
		[shouldIncludeSmart(), smartBidder],
		[shouldIncludeSonobi(), sonobiBidder(pageTargeting)],
		[shouldIncludeTrustX(), trustXBidder],
		[shouldIncludeTripleLift(), tripleLiftBidder],
		[shouldIncludeAppNexus(), appNexusBidder(pageTargeting)],
		[shouldIncludeImproveDigital(), improveDigitalBidder],
		[shouldIncludeImproveDigitalSkin(), improveDigitalSkinBidder],
		[shouldIncludeXaxis(), xaxisBidder],
		[true, pubmaticBidder],
		[shouldIncludeAdYouLike(slotSizes), adYouLikeBidder],
		[shouldUseOzoneAdaptor(), ozoneClientSideBidder(pageTargeting)],
		[shouldIncludeOpenx(), openxClientSideBidder(pageTargeting)],
	];

	const otherBidders = biddersToCheck
		.filter(([shouldInclude]) => inPbTestOr(shouldInclude))
		.map(([, bidder]) => bidder);

	const allBidders = indexExchangeBidders(slotSizes).concat(otherBidders);
	return isPbTestOn()
		? biddersBeingTested(allBidders)
		: biddersSwitchedOn(allBidders);
};

export const bids = (
	slotId: string,
	slotSizes: HeaderBiddingSize[],
	pageTargeting: PageTargeting,
): PrebidBid[] =>
	currentBidders(slotSizes, pageTargeting).map((bidder: PrebidBidder) => ({
		bidder: bidder.name,
		params: bidder.bidParams(slotId, slotSizes),
	}));

export const _ = {
	getIndexSiteId,
	getImprovePlacementId,
	getImproveSkinPlacementId,
	getXaxisPlacementId,
	getTrustXAdUnitId,
	indexExchangeBidders,
};
