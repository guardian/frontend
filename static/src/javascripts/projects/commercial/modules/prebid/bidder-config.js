// @flow

import config from 'lib/config';

export const bidderConfig = {
    sonobi: [
        {edition: 'UK', breakpoint: {min: 'mobile'}, width: 300, height: 250},
        {edition: 'US', breakpoint: {min: 'mobile'}, width: 300, height: 250},
        {edition: 'AUS', breakpoint: {min: 'mobile'}, width: 300, height: 250},
        {edition: 'INT', breakpoint: {min: 'mobile'}, width: 300, height: 250}
    ],
    indexExchange: [
        {edition: 'UK', breakpoint: {min: 'mobile'}, width: 300, height: 250},
        {edition: 'US', breakpoint: {min: 'mobile'}, width: 300, height: 250},
        {edition: 'AUS', breakpoint: {min: 'mobile'}, width: 300, height: 250},
        {edition: 'INT', breakpoint: {min: 'mobile'}, width: 300, height: 250}
    ]
};

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

export const sonobiBidder: PrebidBidder = {
    name: 'sonobi',
    bidParams: (slotId: string): PrebidSonobiParams => {
        return {
            ad_unit: config.page.adUnit,
            dom_id: slotId,
            floor: 0.5
        };
    }
};

export const indexExchangeBidder: PrebidBidder = {
    name: 'indexExchange',
    bidParams: (slotId: string): PrebidIndexExchangeParams => {
        return {
            id: config.page.adUnit,
            siteID: '208206'
        };
    }
};

