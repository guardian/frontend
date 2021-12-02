import type { AdSizeString } from '@guardian/commercial-core';
import { adSizes } from '@guardian/commercial-core';
import config from 'lib/config';
import { getUrlVars } from '../../../../lib/url';
import type { Advert } from './Advert';
import { getAdvertById } from './get-advert-by-id';
import { enableLazyLoad } from './lazy-load';
import { memoizedFetchNonRefreshableLineItemIds } from './non-refreshable-line-items';

const outstreamSizes = [
	adSizes.outstreamDesktop.toString(),
	adSizes.outstreamMobile.toString(),
	adSizes.outstreamGoogleDesktop.toString(),
];

/**
 * Determine whether an advert should refresh, taking into account
 * its size, whether there's a pageskin or whether the advert's
 * line item is marked as non-refreshable
 *
 *  - Fluid ads should not refresh
 *  - Outstream ads should not refresh
 *  - Pageskins should not refresh
 *  - Ads that have line items marked as non-refreshable should not be
 * 	  refreshed. This information is retrieved via the DFP non refreshable
 * 	  line item API endpoint
 *
 * @param advert The candidate advert to check
 * @param nonRefreshableLineItemIds The array of line item ids for which
 * adverts should not refresh
 */
const shouldRefresh = (
	advert: Advert,
	nonRefreshableLineItemIds: number[] = [],
): boolean => {
	const sizeString = advert.size?.toString();
	const isNotFluid = sizeString !== '0,0';
	const isOutstream =
		sizeString && outstreamSizes.includes(sizeString as AdSizeString);
	const isNonRefreshableLineItem =
		advert.lineItemId &&
		nonRefreshableLineItemIds.includes(advert.lineItemId);

	return (
		isNotFluid &&
		!isOutstream &&
		!config.get('page.hasPageSkin') &&
		!isNonRefreshableLineItem
	);
};

const setSlotAdRefresh = (
	event: googletag.events.ImpressionViewableEvent,
): void => {
	const advert = getAdvertById(event.slot.getSlotElementId());
	const viewabilityThresholdMs = 30000; // 30 seconds refresh

	if (!advert) {
		return;
	}

	// Asynchronously retrieve the non-refreshable line item ids
	// Only do this if they haven't been attached to the page config
	if (!window.guardian.config.page.dfpNonRefreshableLineItemIds) {
		// Call the memoized function so we only retrieve the value from the API once
		void memoizedFetchNonRefreshableLineItemIds().then(
			(nonRefreshableLineItemIds) => {
				// Determine whether ad should refresh
				// This value will then be checked when the timer has elapsed and
				// we want to know whether to refresh
				advert.shouldRefresh = shouldRefresh(
					advert,
					nonRefreshableLineItemIds,
				);
			},
		);
	}

	// Event listener that will load an advert once a document becomes visible
	const onDocumentVisible = () => {
		if (!document.hidden) {
			document.removeEventListener('visibilitychange', onDocumentVisible);
			enableLazyLoad(advert);
		}
	};

	setTimeout(() => {
		// During the elapsed time, a 'disable-refresh' message may have been posted.
		// Check the flag again.
		if (!advert.shouldRefresh) {
			return;
		}
		// If the document is hidden don't refresh immediately
		// Instead add an event listener to refresh when document becomes visible again
		if (document.hidden) {
			document.addEventListener('visibilitychange', onDocumentVisible);
		} else {
			enableLazyLoad(advert);
		}
	}, viewabilityThresholdMs);
};

/*

  Returns a function to be used as a callback for GTP 'impressionViewable' event

  Uses URL parameters.

 */
export const onSlotViewableFunction = (): ((
	event: googletag.events.ImpressionViewableEvent,
) => void) => {
	const queryParams = getUrlVars();

	if (queryParams.adrefresh !== 'false') {
		return setSlotAdRefresh;
	}

	// Nothing to do. Return an empty callback
	return () => void 0;
};
