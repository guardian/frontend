// @flow

export type PrebidSonobiParams = {
    ad_unit: string,
    dom_id: string,
    floor: number,
    appNexusTargeting: string,
    pageViewId: string,
};

export type PrebidIndexExchangeParams = {
    id: string,
    siteID: string,
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

export type PrebidSlotKey = 'top-above-nav' | 'right' | 'inline' | 'mostpop';

export type PrebidSlotLabel = 'mobile' | 'tablet' | 'desktop';

export type PrebidBidLabel = 'edn-UK' | 'edn-INT' | 'geo-NA';

export type PrebidLabel = PrebidSlotLabel | PrebidBidLabel;

export type PrebidSize = [number, number];

export type PrebidSlot = {
    key: PrebidSlotKey,
    sizes: PrebidSize[],
    labelAny?: PrebidSlotLabel[],
    labelAll?: PrebidSlotLabel[],
};

export type PrebidBidder = {
    name: string,
    bidParams: (
        slotId: string,
        sizes: PrebidSize[]
    ) =>
        | PrebidSonobiParams
        | PrebidIndexExchangeParams
        | PrebidTrustXParams
        | PrebidImproveParams,
    labelAny?: PrebidBidLabel[],
    labelAll?: PrebidBidLabel[],
};

export type PrebidBid = {
    bidder: string,
    params:
        | PrebidSonobiParams
        | PrebidIndexExchangeParams
        | PrebidTrustXParams
        | PrebidImproveParams,
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
