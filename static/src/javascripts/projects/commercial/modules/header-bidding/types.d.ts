import type { AdSize } from '@guardian/commercial-core';

declare global {
	type HeaderBiddingSize = AdSize;

	type HeaderBiddingSlot = {
		key:
			| 'top-above-nav'
			| 'right'
			| 'inline1'
			| 'inline'
			| 'mostpop'
			| 'comments'
			| 'mobile-sticky'
			| 'banner'
			| 'crossword-banner';
		sizes: HeaderBiddingSize[];
	};

	type HeaderBiddingSizeMapping = Record<
		| 'top-above-nav'
		| 'right'
		| 'inline1'
		| 'inline'
		| 'mostpop'
		| 'comments'
		| 'mobile-sticky'
		| 'banner'
		| 'crossword-banner',
		Partial<Record<'desktop' | 'tablet' | 'mobile', AdSize[]>>
	>;

	type PrebidOzoneParams = {
		publisherId: string;
		siteId: string;
		placementId: string;
		customData?: [Record<string, unknown>];
		ozoneData?: Record<string, unknown>;
	};

	type PrebidSonobiParams = {
		ad_unit: string;
		dom_id: string;
		appNexusTargeting: string;
		pageViewId: string;
		render?: string;
	};

	type PrebidPubmaticParams = {
		publisherId: string;
		adSlot: string;
	};

	type PrebidIndexExchangeParams = {
		siteId: string;
		size: HeaderBiddingSize;
	};

	type PrebidTrustXParams = {
		uid: string;
	};

	type PrebidTripleLiftParams = {
		inventoryCode: string;
	};

	type PrebidImproveParams = {
		placementId: number;
		size: {
			w?: number;
			h?: number;
		};
	};

	type PrebidXaxisParams = {
		placementId: number;
	};

	type PrebidAppNexusParams = {
		invCode?: string;
		member?: string;
		placementId?: string;
		keywords: unknown;
		lotame?: unknown;
	};

	type PrebidOpenXParams = {
		delDomain: string;
		unit: string;
		customParams: unknown;
		lotame?: unknown;
	};

	type PrebidAdYouLikeParams = {
		placement: string;
	};

	type PrebidCriteoParams = {
		networkId: number;
	};

	type PrebidSmartParams = {
		siteId: number;
		pageId: number;
		formatId: number;
	};

	type BidderCode =
		| 'adyoulike'
		| 'and'
		| 'appnexus'
		| 'criteo'
		| 'improvedigital'
		| 'ix'
		| 'oxd'
		| 'ozone'
		| 'pubmatic'
		| 'smartadserver'
		| 'sonobi'
		| 'triplelift'
		| 'trustx'
		| 'xhb';

	type PrebidParams =
		| PrebidAdYouLikeParams
		| PrebidAppNexusParams
		| PrebidCriteoParams
		| PrebidImproveParams
		| PrebidIndexExchangeParams
		| PrebidOpenXParams
		| PrebidOzoneParams
		| PrebidPubmaticParams
		| PrebidSmartParams
		| PrebidSonobiParams
		| PrebidTripleLiftParams
		| PrebidTrustXParams
		| PrebidXaxisParams;

	type PrebidBidder = {
		name: BidderCode;
		switchName: string;
		bidParams: (slotId: string, sizes: HeaderBiddingSize[]) => PrebidParams;
	};

	type PrebidBid = {
		bidder: string;
		params: PrebidParams;
	};

	type PrebidMediaTypes = {
		banner: {
			sizes: HeaderBiddingSize[];
		};
	};

	type SlotFlatMap = (slot: HeaderBiddingSlot) => HeaderBiddingSlot[];
}
