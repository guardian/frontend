// @flow

import type { Advert } from 'commercial/modules/dfp/Advert';
import { getUrlVars } from 'lib/url';
import config from 'lib/config';

export type DfpEnv = {
    renderStartTime: number,
    adSlotSelector: string,
    externalDemand: string,
    lazyLoadEnabled: boolean,
    lazyLoadObserve: boolean,
    creativeIDs: Array<number>,
    advertIds: { [k: string]: number },
    advertsToLoad: Array<Advert>,
    advertsToRefresh: Array<Advert>,
    adverts: Array<Advert>,
    shouldLazyLoad: () => boolean,
};

export const dfpEnv: DfpEnv = {
    /* renderStartTime: integer. Point in time when DFP kicks in */
    renderStartTime: -1,

    /* adSlotSelector: string. A CSS selector to query ad slots in the DOM */
    adSlotSelector: '.js-ad-slot',

    /* externalDemand: string. Set to 'prebid' for header-bidding connections, or 'none'. */
    externalDemand: config.get('page.hbImpl'),

    /* lazyLoadEnabled: boolean. Set to true when adverts are lazy-loaded */
    lazyLoadEnabled: false,

    /* lazyLoadObserve: boolean. Use IntersectionObserver in supporting browsers */
    lazyLoadObserve: 'IntersectionObserver' in window,

    /* creativeIDs: array<string>. List of loaded creative IDs */
    creativeIDs: [],

    /* advertIds: map<string -> int>. Keeps track of slot IDs and their position in the array of adverts */
    advertIds: {},

    /* advertsToLoad: array<Advert>. Lists adverts waiting to be loaded */
    advertsToLoad: [],

    /* advertsToRefresh: array<Advert>. Lists adverts refreshed when a breakpoint has been crossed */
    advertsToRefresh: [],

    /* adverts: array<Advert>. Keeps track of adverts and their state */
    adverts: [],

    /* shouldLazyLoad: () -> boolean. Determines whether ads should be lazy loaded */
    shouldLazyLoad() {
        // We do not want lazy loading on pageskins because it messes up the roadblock
        // Also, if the special dll parameter is passed with a value of 1, we don't lazy load
        return !config.get('page.hasPageSkin') && getUrlVars().dll !== '1';
    },
};
