// @flow strict

export type PrebidSize = [number, number];

export type PrebidOzoneParams = {
    publisherId: string,
    siteId: string,
    placementId: string,
    customData?: [{ [string]: mixed }],
    ozoneData?: { [string]: mixed },
};

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

export type PrebidTripleLiftParams = {
    inventoryCode: string,
};

export type PrebidImproveParams = {
    placementId: number,
    size: {
        w?: number,
        h?: number,
    },
};

export type PrebidXaxisParams = {
    placementId: number,
};

export type PrebidAppNexusParams = {
    invCode?: string,
    member?: string,
    placementId?: string,
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

export type PrebidSlot = {
    key:
        | 'top-above-nav'
        | 'right'
        | 'inline1'
        | 'inline'
        | 'mostpop'
        | 'comments'
        | 'mobile-sticky'
        | 'banner',
    sizes: PrebidSize[],
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
        | PrebidTripleLiftParams
        | PrebidImproveParams
        | PrebidXaxisParams
        | PrebidAppNexusParams
        | PrebidOpenXParams
        | PrebidOzoneParams
        | PrebidAdYouLikeParams
        | PrebidPubmaticParams,
};

export type PrebidBid = {
    bidder: string,
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
        | PrebidPubmaticParams,
};

export type PrebidMediaTypes = {
    banner: {
        sizes: PrebidSize[],
    },
};
