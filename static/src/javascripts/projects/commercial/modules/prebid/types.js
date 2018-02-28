// @flow

export type PrebidIndexExchangeParams = {
    id: string,
    siteID: string,
};

export type PrebidSonobiParams = {
    ad_unit: string,
    dom_id: ?string,
    floor: ?number,
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

export type PrebidBid = {
    bidder: string,
    params:
        | PrebidSonobiParams
        | PrebidIndexExchangeParams
        | PrebidTrustXParams
        | PrebidImproveParams,
};

export type PrebidEdition = 'UK' | 'US' | 'AUS' | 'INT';

export type PrebidSize = [number, number];

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
};

export type PrebidAdSlotCriteria = {
    geoContinent?: string,
    editions?: PrebidEdition[],
    breakpoint: Object,
    sizes: PrebidSize[],
    slots: string[],
};

export type PrebidBidderCriteria = {
    [bidder: string]: PrebidAdSlotCriteria[],
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
