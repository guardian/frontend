// @flow

import config from 'lib/config';
import type {
    PrebidBidderCriteria,
    PrebidBidder,
    PrebidIndexExchangeParams,
    PrebidSonobiParams,
    PrebidTrustXParams,
} from 'commercial/modules/prebid/types';

export const bidderConfig: PrebidBidderCriteria = {
    sonobi: [
        {
            edition: 'any',
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250]],
            slots: ['dfp-ad--inline', 'dfp-ad--mostpop', 'dfp-ad--right'],
        },
        {
            edition: 'any',
            breakpoint: { min: 'desktop' },
            sizes: [[728, 90], [970, 250]],
            slots: ['dfp-ad--top-above-nav'],
        },
    ],
    indexExchange: [
        {
            edition: 'any',
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250]],
            slots: ['dfp-ad--inline', 'dfp-ad--mostpop', 'dfp-ad--right'],
        },
        {
            edition: 'any',
            breakpoint: { min: 'desktop' },
            sizes: [[728, 90], [970, 250]],
            slots: ['dfp-ad--top-above-nav'],
        },
    ],
    trustx: [
        {
            edition: 'any',
            breakpoint: { min: 'mobile' },
            sizes: [[300, 250]],
            slots: ['dfp-ad--inline', 'dfp-ad--mostpop', 'dfp-ad--right'],
        },
        {
            edition: 'any',
            breakpoint: { min: 'desktop' },
            sizes: [[728, 90], [970, 250]],
            slots: ['dfp-ad--top-above-nav'],
        },
    ],
};

export const sonobiBidder: PrebidBidder = {
    name: 'sonobi',
    bidParams: (slotId: string): PrebidSonobiParams => ({
        ad_unit: config.page.adUnit,
        dom_id: slotId,
        floor: 0.5,
    }),
};

export const indexExchangeBidder: PrebidBidder = {
    name: 'indexExchange',
    bidParams: (): PrebidIndexExchangeParams => ({
        id: config.page.adUnit,
        siteID: '208206',
    }),
};

export const trustXBidder: PrebidBidder = {
    name: 'trustx',
    bidParams: (slotId: string): PrebidTrustXParams => ({
        uid: slotId,
    }),
};
