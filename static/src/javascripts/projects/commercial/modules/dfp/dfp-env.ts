import config from '../../../../lib/config';
import { getUrlVars } from '../../../../lib/url';
import type { Advert } from './Advert';

interface IDfpEnv {
	renderStartTime: number;
	readonly adSlotSelector: string;
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

class DfpEnv implements IDfpEnv {
	/* renderStartTime: integer. Point in time when DFP kicks in */
	renderStartTime: number;

	/* adSlotSelector: string. A CSS selector to query ad slots in the DOM */
	readonly adSlotSelector: string;

	/* hbImpl: Returns an object {'prebid': boolean, 'a9': boolean} to indicate which header bidding implementations are switched on */
	hbImpl: {
		prebid: boolean;
		a9: boolean;
	};

	/* lazyLoadEnabled: boolean. Set to true when adverts are lazy-loaded */
	lazyLoadEnabled: boolean;

	/* lazyLoadObserve: boolean. Use IntersectionObserver in supporting browsers */
	lazyLoadObserve: boolean;

	/* creativeIDs: array<string>. List of loaded creative IDs */
	creativeIDs: string[];

	/* advertIds: map<string -> int>. Keeps track of slot IDs and their position in the array of adverts */
	advertIds: Record<string, number>;

	/* advertsToLoad: array<Advert>. Lists adverts waiting to be loaded */
	advertsToLoad: Advert[];

	/* advertsToRefresh: array<Advert>. Lists adverts refreshed when a breakpoint has been crossed */
	advertsToRefresh: Advert[];

	/* adverts: array<Advert>. Keeps track of adverts and their state */
	adverts: Advert[];

	constructor() {
		this.renderStartTime = -1;
		this.adSlotSelector = '.js-ad-slot';
		this.hbImpl = {
			// TODO: fix the Switch type upstream
			prebid: switches.prebidHeaderBidding ?? false,
			a9: switches.a9HeaderBidding ?? false,
		};
		this.lazyLoadEnabled = false;
		this.lazyLoadObserve = 'IntersectionObserver' in window;
		this.creativeIDs = [];
		this.advertIds = {};
		this.advertsToLoad = [];
		this.advertsToRefresh = [];
		this.adverts = [];
	}

	/* shouldLazyLoad: () -> boolean. Determines whether ads should be lazy loaded */
	shouldLazyLoad(): boolean {
		// We do not want lazy loading on pageskins because it messes up the roadblock
		// Also, if the special dll parameter is passed with a value of 1, we don't lazy load
		return !config.get('page.hasPageSkin') && getUrlVars().dll !== '1';
	}
}

export const dfpEnv = new DfpEnv();
