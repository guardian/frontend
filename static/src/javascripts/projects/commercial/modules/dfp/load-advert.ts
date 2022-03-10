import { EventTimer } from '@guardian/commercial-core';
import { a9 } from '../header-bidding/a9/a9';
import { prebid } from '../header-bidding/prebid/prebid';
import { stripDfpAdPrefixFrom } from '../header-bidding/utils';
import type { Advert } from './Advert';

const forcedSlotSize = (advert: Advert, hbSlot: HeaderBiddingSlot) => {
	// We only fiddle with top-above-nav hbSlot(s)
	if (hbSlot.key !== 'top-above-nav') {
		return [hbSlot];
	}
	// For top-above-nav slots, we force the refreshed
	// to be the same size as the first display
	if (hbSlot.sizes.length === 1) {
		// No point forcing a size, as there is already only one
		// possible (mobile/tablet). See prebid/slot-config.js
		return [hbSlot];
	}

	if (Array.isArray(advert.size)) {
		return [
			Object.assign({}, hbSlot, {
				sizes: [[advert.size[0], advert.size[1]]],
			}),
		];
	}
	// No point having this hbSlot, as advert.size is not an array
	return [];
};

const eventTimer = EventTimer.get();

export const loadAdvert = (advert: Advert): void => {
	const adName = stripDfpAdPrefixFrom(advert.id);
	// TODO can slotReady come after header bidding?
	void advert.whenSlotReady
		.catch(() => {
			// The display needs to be called, even in the event of an error.
		})
		.then(() => {
			eventTimer.trigger('slotReady', adName);
			advert.startLoading();
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
					forcedSlotSize(advert, prebidSlot),
			);

			const a9Promise = a9.requestBids(
				advert,
				(a9Slot: HeaderBiddingSlot) => forcedSlotSize(advert, a9Slot),
			);
			return Promise.all([prebidPromise, a9Promise]);
		})
		.then(() => {
			advert.slot.setTargeting('refreshed', 'true');
			if (advert.id === 'dfp-ad--top-above-nav') {
				// force the slot sizes to be the same as advert.size (current)
				// only when advert.size is an array (forget 'fluid' and other specials)
				if (Array.isArray(advert.size)) {
					advert.slot.defineSizeMapping([[[0, 0], [advert.size]]]);
				}
			}
			window.googletag.pubads().refresh([advert.slot]);
		});
};
