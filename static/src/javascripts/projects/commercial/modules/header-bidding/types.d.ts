type HeaderBiddingSize = [number, number];

type HeaderBiddingSlot = {
	key:
		| 'top-above-nav'
		| 'right'
		| 'inline1'
		| 'inline'
		| 'mostpop'
		| 'comments'
		| 'mobile-sticky'
		| 'banner';
	sizes: HeaderBiddingSize[];
};

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

type PrebidBidder = {
	name: string;
	switchName: string;
	bidParams: (
		slotId: string,
		sizes: HeaderBiddingSize[],
	) =>
		| PrebidSonobiParams
		| PrebidIndexExchangeParams
		| PrebidTrustXParams
		| PrebidTripleLiftParams
		| PrebidImproveParams
		| PrebidXaxisParams
		| PrebidAppNexusParams
		| PrebidOpenXParams
		| PrebidOzoneParams
		| PrebidAdYouLikeParams
		| PrebidPubmaticParams;
};

type PrebidBid = {
	bidder: string;
	params:
		| PrebidSonobiParams
		| PrebidIndexExchangeParams
		| PrebidTrustXParams
		| PrebidTripleLiftParams
		| PrebidImproveParams
		| PrebidXaxisParams
		| PrebidAppNexusParams
		| PrebidOpenXParams
		| PrebidOzoneParams
		| PrebidAdYouLikeParams
		| PrebidPubmaticParams;
};

type PrebidMediaTypes = {
	banner: {
		sizes: HeaderBiddingSize[];
	};
};
