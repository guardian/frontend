import config from '../../../../lib/config';
import { getUrlVars } from '../../../../lib/url';
import type { Advert } from './Advert';

interface HbImpl {
	prebid: boolean;
	a9: boolean;
}
interface IDfpEnv {
	renderStartTime: number;
	readonly adSlotSelector: string;
	hbImpl: HbImpl;
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
	/**
	 * Point in time when DFP kicks in
	 */
	renderStartTime: number;

	/**
	 * A CSS selector to query ad slots in the DOM
	 */
	readonly adSlotSelector: string;

	/**
	 * Indicates which header bidding implementations are switched on
	 */
	hbImpl: HbImpl;

	/**
	 * lazyLoadEnabled: boolean. Set to true when adverts are lazy-loaded
	 */
	lazyLoadEnabled: boolean;

	/**
	 * Use IntersectionObserver in supporting browsers
	 */
	lazyLoadObserve: boolean;

	/**
	 * List of loaded creative IDs
	 */
	creativeIDs: string[];

	/**
	 * Keeps track of slot IDs and their position in the array of adverts
	 */
	advertIds: Record<string, number>;

	/**
	 * Lists adverts waiting to be loaded
	 */
	advertsToLoad: Advert[];

	/**
	 * Lists adverts refreshed when a breakpoint has been crossed
	 */
	advertsToRefresh: Advert[];

	/**
	 * Keeps track of adverts and their state
	 */
	adverts: Advert[];

	constructor(
		adSlotSelector: string,
		hbImpl: HbImpl,
		lazyLoadEnabled: boolean,
		lazyLoadObserve: boolean,
	) {
		this.renderStartTime = -1;
		this.adSlotSelector = adSlotSelector;
		this.hbImpl = hbImpl;
		this.lazyLoadEnabled = lazyLoadEnabled;
		this.lazyLoadObserve = lazyLoadObserve;
		this.creativeIDs = [];
		this.advertIds = {};
		this.advertsToLoad = [];
		this.advertsToRefresh = [];
		this.adverts = [];
	}

	/**
	 * Determines whether ads should be lazy loaded
	 */
	shouldLazyLoad(): boolean {
		// We do not want lazy loading on pageskins because it messes up the roadblock
		// Also, if the special dll parameter is passed with a value of 1, we don't lazy load
		return !config.get('page.hasPageSkin') && getUrlVars().dll !== '1';
	}
}

export const dfpEnv = new DfpEnv(
	'.js-ad-slot',
	{
		// TODO: fix the Switch type upstream
		prebid: switches.prebidHeaderBidding ?? false,
		a9: switches.a9HeaderBidding ?? false,
	},
	false,
	'IntersectionObserver' in window,
);
