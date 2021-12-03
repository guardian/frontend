import config from '../../../../lib/config';
import { getUrlVars } from '../../../../lib/url';
import type { Advert } from './Advert';

interface HbImpl {
	prebid: boolean;
	a9: boolean;
}
interface IDfpEnv {
	readonly adSlotSelector: string;
	hbImpl: HbImpl;
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
	 * A CSS selector to query ad slots in the DOM
	 */
	readonly adSlotSelector: string;

	/**
	 * Indicates which header bidding implementations are switched on
	 */
	hbImpl: HbImpl;

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
		lazyLoadObserve: boolean,
	) {
		this.queueAdvert = this.queueAdvert.bind(this);

		this.adSlotSelector = adSlotSelector;
		this.hbImpl = hbImpl;
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

	/**
	 * Add advert to the array of adverts to load
	 * Also add to the array of ads to refresh on resize if necessary
	 */
	queueAdvert(advert: Advert): void {
		this.advertsToLoad.push(advert);
		// Add to the array of ads to be refreshed (when the breakpoint changes)
		// only if its `data-refresh` attribute isn't set to false.
		if (advert.node.dataset.refresh !== 'false') {
			this.advertsToRefresh.push(advert);
		}
	}
}

export const dfpEnv = new DfpEnv(
	'.js-ad-slot',
	{
		// TODO: fix the Switch type upstream
		prebid: switches.prebidHeaderBidding ?? false,
		a9: switches.a9HeaderBidding ?? false,
	},
	'IntersectionObserver' in window,
);
