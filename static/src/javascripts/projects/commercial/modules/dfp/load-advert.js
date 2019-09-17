// @flow
import { Advert } from 'commercial/modules/dfp/Advert';
import prebid from 'commercial/modules/prebid/prebid';
import { markTime } from 'lib/user-timing';

export const loadAdvert = (advert: Advert): void => {
    advert.whenSlotReady
        .catch(() => {
            // The display needs to be called, even in the event of an error.
        })
        .then(() => {
            markTime(`Commercial: Slot Ready: ${advert.id}`);
            advert.startLoading();
            return prebid.requestBids(advert);
        })
        .then(() => window.googletag.display(advert.id));
};

export const refreshAdvert = (advert: Advert): void => {
    // advert.size contains the effective size being displayed prior to refreshing
    advert.whenSlotReady
        .then(() =>
            prebid.requestBids(advert, prebidSlot => {
                // We only fiddle with top-above-nav prebidSlot(s)
                if (prebidSlot.key !== 'top-above-nav') {
                    return [prebidSlot];
                }
                // For top-above-nav slots, we force the refreshed
                // to be the same size as the first display
                if (prebidSlot.sizes.length === 1) {
                    // No point forcing a size, as there is already only one
                    // possible (mobile/tablet). See prebid/slot-config.js
                    return [prebidSlot];
                }
                // Prebid slots only support array sizes (no string literals).
                if (Array.isArray(advert.size)) {
                    return [
                        Object.assign({}, prebidSlot, {
                            sizes: [[advert.size[0], advert.size[1]]],
                        }),
                    ];
                }
                // No point having this prebidSlot, as advert.size is not an array
                return [];
            })
        )
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
