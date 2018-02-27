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
} from 'commercial-control/modules/prebid/types';

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
};

export const sonobiBidder: PrebidBidder = {
    name: 'sonobi',
    bidParams: (slotId: string): PrebidSonobiParams => ({
        ad_unit: config.page.adUnit,
        dom_id: slotId,
        floor: 0.5,
        appNexusTargeting: buildAppNexusTargeting(buildPageTargeting()),
        pageViewId: config.ophan.pageViewId,
    }),
};

export const indexExchangeBidder: PrebidBidder = {
    name: 'indexExchange',
    bidParams: (): PrebidIndexExchangeParams => ({
        id: '185406',
        siteID: getIndexSiteId(),
    }),
};
