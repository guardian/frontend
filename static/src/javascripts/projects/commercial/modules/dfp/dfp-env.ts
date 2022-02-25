import config from '../../../../lib/config';
import { getUrlVars as _getUrlVars } from '../../../../lib/url';
import type { Advert } from './Advert';

const getUrlVars = _getUrlVars as (arg?: string) => Record<string, string>;

interface DfpEnv {
	renderStartTime: number;
	adSlotSelector: string;
	hbImpl: Record<string, boolean>;
	lazyLoadEnabled: boolean;
	lazyLoadObserve: boolean;
	creativeIDs: string[];
	advertIds: Record<string, number>;
	advertsToLoad: Advert[];
	advertsToRefresh: Advert[];
	adverts: Advert[];
	shouldLazyLoad: () => boolean;
}

const { switches } = window.guardian.config;

export const dfpEnv: DfpEnv = {
	/* renderStartTime: integer. Point in time when DFP kicks in */
	renderStartTime: -1,

	/* adSlotSelector: string. A CSS selector to query ad slots in the DOM */
	adSlotSelector: '.js-ad-slot',

	/* hbImpl: Returns an object {'prebid': boolean, 'a9': boolean} to indicate which header bidding implementations are switched on */
	hbImpl: {
		// TODO: fix the Switch type upstream
		prebid: switches.prebidHeaderBidding ?? false,
		a9: switches.a9HeaderBidding ?? false,
	},
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
	shouldLazyLoad(): boolean {
		// We do not want lazy loading on pageskins because it messes up the roadblock
		// Also, if the special dll parameter is passed with a value of 1, we don't lazy load
		return (
			!(
				config as {
					get: (arg: string) => boolean;
				}
			).get('page.hasPageSkin') && getUrlVars().dll !== '1'
		);
	},
};
