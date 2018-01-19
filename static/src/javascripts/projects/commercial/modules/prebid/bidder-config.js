// @flow

import config from 'lib/config';
import { getBreakpoint } from 'lib/detect';
import {
    buildAppNexusTargeting,
    buildPageTargeting,
} from 'common/modules/commercial/build-page-targeting';
import type {
    PrebidBidder,
    PrebidBidderCriteria,
    PrebidIndexExchangeParams,
    PrebidSonobiParams,
    PrebidTrustXParams,
} from 'commercial/modules/prebid/types';

const getTrustXAdUnitId = (slotId: string): string => {
    switch (slotId) {
        case 'dfp-ad--inline':
            return '2960';
        case 'dfp-ad--mostpop':
            return '2961';
        case 'dfp-ad--right':
            return '2962';
        case 'dfp-ad--top-above-nav':
            return '2963';
        default:
            console.log(
                `PREBID: Failed to get TrustX ad unit for slot ${slotId}.`
            );
            return '';
    }
};

const getBreakpointKey = (): string => {
    switch (getBreakpoint()) {
        case 'mobile':
        case 'mobileMedium':
        case 'mobileLandscape':
        case 'phablet':
            return 'M';
        case 'tablet':
            return 'T';
        case 'desktop':
        case 'leftCol':
        case 'wide':
            return 'D';
        default:
            return 'D';
    }
};

const getIndexSiteId = (): string => {
    const site = config.page.pbIndexSites.find(
        s => s.bp === getBreakpointKey()
    );
    return site ? site.id : '';
};

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
        appNexusTargeting: buildAppNexusTargeting(buildPageTargeting()),
    }),
};

export const indexExchangeBidder: PrebidBidder = {
    name: 'indexExchange',
    bidParams: (): PrebidIndexExchangeParams => ({
        id: '185406',
        siteID: getIndexSiteId(),
    }),
};

export const trustXBidder: PrebidBidder = {
    name: 'trustx',
    bidParams: (slotId: string): PrebidTrustXParams => ({
        uid: getTrustXAdUnitId(slotId),
    }),
};
