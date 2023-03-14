/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import type { AdSize } from '@guardian/commercial-core';
import { EventTimer } from '@guardian/commercial-core';
import { a9 } from '../header-bidding/a9/a9';
import { prebid } from '../header-bidding/prebid/prebid';
import { stripDfpAdPrefixFrom } from '../header-bidding/utils';
import type { Advert } from './Advert';

// Force the refreshed advert to be the same size as the first
const retainTopAboveNavSlotSize = (
	advertSize: Advert['size'],
	hbSlot: HeaderBiddingSlot,
): HeaderBiddingSlot[] => {
	if (hbSlot.key !== 'top-above-nav') {
		return [hbSlot];
	}

	// No point forcing a size, as there is already only one possible (mobile/tablet).
	// See prebid/slot-config.js
	if (hbSlot.sizes.length === 1) {
		return [hbSlot];
	}

	// If advert.size is not an array, there is no point having this hbSlot
	if (!Array.isArray(advertSize)) {
		return [];
	}

	return [
		{
			...hbSlot,
			sizes: [[advertSize[0], advertSize[1]] as AdSize],
		},
	];
};

const eventTimer = EventTimer.get();

export const loadAdvert = (advert: Advert): void => {
	const adName = stripDfpAdPrefixFrom(advert.id);
	// TODO can slotReady come after header bidding?
	// If so, the callbacks pushed onto the ias queue in define-slot.js
	// could be run in parallel with the calls to requestBids below, reducing the
	// total time to display the ad.
	void advert.whenSlotReady
		.catch(() => {
			// The display needs to be called, even in the event of an error.
		})
		.then(() => {
			eventTimer.trigger('slotReady', adName);
			return Promise.all([
				prebid.requestBids(advert),
				a9.requestBids(advert),
			]);
		})
		.then(() => {
			eventTimer.trigger('slotInitialised', adName);
			window.googletag.display(advert.id);
		});
};

export const refreshAdvert = (advert: Advert): void => {
	// advert.size contains the effective size being displayed prior to refreshing
	void advert.whenSlotReady
		.then(() => {
			const prebidPromise = prebid.requestBids(
				advert,
				(prebidSlot: HeaderBiddingSlot) =>
					retainTopAboveNavSlotSize(advert.size, prebidSlot),
			);

			const a9Promise = a9.requestBids(
				advert,
				(a9Slot: HeaderBiddingSlot) =>
					retainTopAboveNavSlotSize(advert.size, a9Slot),
			);

			return Promise.all([prebidPromise, a9Promise]);
		})
		.then(() => {
			advert.slot.setTargeting('refreshed', 'true');

			if (advert.id === 'dfp-ad--top-above-nav') {
				// force the slot sizes to be the same as advert.size (current)
				// only when advert.size is an array (forget 'fluid' and other specials)
				if (Array.isArray(advert.size)) {
					const mapping = window.googletag.sizeMapping();
					mapping.addSize(
						[0, 0],
						advert.size as googletag.GeneralSize,
					);
					advert.slot.defineSizeMapping(mapping.build());
				}
			}

			window.googletag.pubads().refresh([advert.slot]);
		});
};
