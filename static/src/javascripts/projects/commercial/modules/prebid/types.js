// @flow strict

export type PrebidSize = [number, number];

export type PrebidSonobiParams = {
    ad_unit: string,
    dom_id: string,
    appNexusTargeting: string,
    pageViewId: string,
    render?: string,
};

export type PrebidPubmaticParams = {
    publisherId: string,
    adSlot: string,
};

export type PrebidIndexExchangeParams = {
    siteId: string,
    size: PrebidSize,
};

export type PrebidTrustXParams = {
    uid: string,
};

export type PrebidImproveSizeParam = {
    w?: number,
    h?: number,
};

export type PrebidImproveParams = {
    placementId: number,
    size: PrebidImproveSizeParam,
};

export type PrebidXaxisParams = {
    placementId: number,
};

export type PrebidAppNexusParams = {
    invCode?: string,
    member?: string,
    placementId: string,
    keywords: {},
    lotame?: {},
};

export type PrebidOpenXParams = {
    delDomain: string,
    unit: string,
    customParams: {},
    lotame?: {},
};

export type PrebidAdYouLikeParams = {
    placement: string,
};

export type PrebidSlotKey =
    | 'top-above-nav'
    | 'right'
    | 'inline1'
    | 'inline'
    | 'mostpop'
    | 'comments';

export type PrebidSlotLabel =
    | 'mobile'
    | 'tablet'
    | 'desktop'
    | 'article'
    | 'non-article';

export type PrebidBidLabel = 'edn-UK' | 'edn-INT' | 'geo-NA' | 'deal-FirstLook';

export type PrebidLabel = PrebidSlotLabel | PrebidBidLabel;

export type PrebidSlot = {
    key: PrebidSlotKey,
    sizes: PrebidSize[],
    labelAny?: PrebidSlotLabel[],
    labelAll?: PrebidSlotLabel[],
};

export type PrebidBidder = {
    name: string,
    switchName: string,
    bidParams: (
        slotId: string,
        sizes: PrebidSize[]
    ) =>
        | PrebidSonobiParams
        | PrebidIndexExchangeParams
        | PrebidTrustXParams
        | PrebidImproveParams
        | PrebidXaxisParams
        | PrebidAppNexusParams
        | PrebidOpenXParams
        | PrebidAdYouLikeParams
        | PrebidPubmaticParams,
    labelAny?: PrebidBidLabel[],
    labelAll?: PrebidBidLabel[],
};

export type PrebidBid = {
    bidder: string,
    params:
        | PrebidSonobiParams
        | PrebidIndexExchangeParams
        | PrebidTrustXParams
        | PrebidImproveParams
        | PrebidXaxisParams
        | PrebidAppNexusParams
        | PrebidOpenXParams
        | PrebidAdYouLikeParams
        | PrebidPubmaticParams,
    labelAny?: PrebidBidLabel[],
    labelAll?: PrebidBidLabel[],
};

export type PrebidPriceBucket = {
    precision?: number,
    min: number,
    max: number,
    increment: number,
};

export type PrebidPriceGranularity = {
    buckets: PrebidPriceBucket[],
};

export type PrebidBanner = {
    sizes: PrebidSize[],
};

export type PrebidMediaTypes = {
    banner: PrebidBanner,
};
