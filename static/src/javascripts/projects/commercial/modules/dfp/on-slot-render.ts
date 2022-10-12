import type { AdSize } from '@guardian/commercial-core';
import { createAdSize } from '@guardian/commercial-core';
import { isString } from '@guardian/libs';
import { mediator } from '../../../../lib/mediator';
import reportError from '../../../../lib/report-error';
import { dfpEnv } from './dfp-env';
import { emptyAdvert } from './empty-advert';
import { getAdvertById } from './get-advert-by-id';
import { renderAdvert } from './render-advert';
import { shouldRefresh } from './should-refresh';

const reportEmptyResponse = (
	adSlotId: string,
	event: googletag.events.SlotRenderEndedEvent,
) => {
	// This empty slot could be caused by a targeting problem,
	// let's report these and diagnose the problem in sentry.
	// Keep the sample rate low, otherwise we'll get rate-limited (report-error will also sample down)
	if (Math.random() < 1 / 10_000) {
		const adUnitPath = event.slot.getAdUnitPath();
		const adTargetingKeys = event.slot.getTargetingKeys();
		const adTargetingKValues = adTargetingKeys.includes('k')
			? event.slot.getTargeting('k')
			: [];
		const adKeywords = adTargetingKValues.join(', ');

		reportError(
			new Error('dfp returned an empty ad response'),
			{
				feature: 'commercial',
				adUnit: adUnitPath,
				adSlot: adSlotId,
				adKeywords,
			},
			false,
		);
	}
};

const sizeEventToAdSize = (size: string | number[]): AdSize | 'fluid' => {
	if (isString(size)) return 'fluid';
	return createAdSize(size[0], size[1]);
};

export const onSlotRender = (
	event: googletag.events.SlotRenderEndedEvent,
): void => {
	const advert = getAdvertById(event.slot.getSlotElementId());
	if (!advert) {
		return;
	}

	const emitRenderEvents = (isRendered: boolean) => {
		advert.finishedRendering(isRendered);
		mediator.emit('modules:commercial:dfp:rendered', event);
	};

	advert.isEmpty = event.isEmpty;

	if (event.isEmpty) {
		emptyAdvert(advert);
		reportEmptyResponse(advert.id, event);
		emitRenderEvents(false);
	} else {
		/**
		 * if advert.hasPrebidSize is false we use size
		 * from the GAM event when adjusting the slot size.
		 * */
		if (!advert.hasPrebidSize) {
			advert.size = sizeEventToAdSize(event.size);
		}

		if (event.creativeId) {
			dfpEnv.creativeIDs.push(String(event.creativeId));
		}

		// Check if the non-refreshable line items are attached to the page config and fetching is switched off
		// If they are then use these values to determine slot refresh at this point
		// Otherwise wait until slot is viewable to fetch line item ids from endpoint
		if (
			!window.guardian.config.switches.fetchNonRefreshableLineItems &&
			window.guardian.config.page.nonRefreshableLineItemIds
		) {
			// Set refresh field based on the outcome of the slot render.
			advert.shouldRefresh = shouldRefresh(
				advert,
				window.guardian.config.page.nonRefreshableLineItemIds,
				event.lineItemId ?? undefined,
			);
		} else {
			// Otherwise associate the line item id with the advert
			// so it can be used at the point the slot becomes viewable
			advert.lineItemId = event.lineItemId;
		}

		void renderAdvert(advert, event).then(emitRenderEvents);
	}
};
