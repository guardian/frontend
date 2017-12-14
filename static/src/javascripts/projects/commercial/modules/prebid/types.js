// @flow

export type PrebidBid = {
    bidder: string,
    params: PrebidSonobiParams | PrebidIndexExchangeParams
};

export type PrebidSize = [number, number];

export type PrebidBidder = {
    name: string,
    bidParams: (slotId: string) => PrebidSonobiParams | PrebidIndexExchangeParams
};

export type PrebidIndexExchangeParams = {
    id: string,
    siteID: string
}

export type PrebidSonobiParams = {
    ad_unit: string,
    dom_id: ?string,
    floor: ?number
}

export type PrebidAdSlotCriteria = {
    edition: 'UK' | 'US' | 'AUS' | 'INT',
    breakpoint: Object,
    size: PrebidSize
};

export type PrebidBidderCriteria = {
    [bidder: string]: PrebidAdSlotCriteria[]
};