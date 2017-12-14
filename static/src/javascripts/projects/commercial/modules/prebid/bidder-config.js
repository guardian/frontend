// @flow

import config from 'lib/config';
import type {
    PrebidBidderCriteria,
    PrebidAdSlotCriteria,
    PrebidBidder,
    PrebidIndexExchangeParams,
    PrebidSonobiParams
} from 'commercial/modules/prebid/types';

export const bidderConfig: PrebidBidderCriteria = {
    sonobi: [
        {edition: 'UK', breakpoint: {min: 'mobile'}, size: [ 300, 250 ] },
        {edition: 'US', breakpoint: {min: 'mobile'}, size: [ 300, 250 ] },
        {edition: 'AUS', breakpoint: {min: 'mobile'}, size: [ 300, 250 ] },
        {edition: 'INT', breakpoint: {min: 'mobile'}, size: [ 300, 250 ] }
    ],
    indexExchange: [
        {edition: 'UK', breakpoint: {min: 'mobile'}, size: [ 300, 250 ] },
        {edition: 'US', breakpoint: {min: 'mobile'}, size: [ 300, 250 ] },
        {edition: 'AUS', breakpoint: {min: 'mobile'}, size: [ 300, 250 ] },
        {edition: 'INT', breakpoint: {min: 'mobile'}, size: [ 300, 250 ] }
    ]
};

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

