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

export type PrebidImproveDigitalParams = {
    placementId: number,
};

export type PrebidBid = {
    bidder: string,
    params:
        | PrebidSonobiParams
        | PrebidIndexExchangeParams
        | PrebidTrustXParams
        | PrebidImproveDigitalParams,
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
        | PrebidImproveDigitalParams,
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
