import { log } from '@guardian/libs';
import { getUrlVars } from '../../../../lib/url';
import { getAdvertById } from './get-advert-by-id';
import { enableLazyLoad } from './lazy-load';
import { memoizedFetchNonRefreshableLineItemIds } from './non-refreshable-line-items';
import { setAdSlotMinHeight } from './render-advert';
import { shouldRefresh } from './should-refresh';

const ADVERT_REFRESH_RATE = 30_000; // 30 seconds

const setSlotAdRefresh = (
	event: googletag.events.ImpressionViewableEvent,
): void => {
	const advert = getAdvertById(event.slot.getSlotElementId());
	if (!advert) {
		return;
	}

	const viewabilityThresholdMs = ADVERT_REFRESH_RATE;

	// Asynchronously retrieve the non-refreshable line item ids
	// Only do this if they haven't been attached to the page config
	const { switches, page } = window.guardian.config;
	if (
		switches.fetchNonRefreshableLineItems &&
		!page.nonRefreshableLineItemIds
	) {
		// Call the memoized function so we only retrieve the value from the API once
		void memoizedFetchNonRefreshableLineItemIds()
			.then((nonRefreshableLineItemIds) => {
				// Determine whether ad should refresh
				// This value will then be checked when the timer has elapsed and
				// we want to know whether to refresh
				const shouldSlotRefresh = shouldRefresh(
					advert,
					nonRefreshableLineItemIds,
				);

				advert.shouldRefresh = shouldSlotRefresh;

				if (shouldSlotRefresh) setAdSlotMinHeight(advert);
			})
			.catch((error) => {
				log(
					'commercial',
					'⚠️ Error fetching non-refreshable line items',
					error,
				);
			});
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
