import { Advert } from 'commercial/modules/dfp/Advert';
import prebid from 'commercial/modules/header-bidding/prebid/prebid';
import { markTime } from 'lib/user-timing';
import a9 from 'commercial/modules/header-bidding/a9/a9';

const forcedSlotSize = (advert, hbSlot) => {
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

export const loadAdvert = (advert) => {
    advert.whenSlotReady
        .catch(() => {
            // The display needs to be called, even in the event of an error.
        })
        .then(() => {
            markTime(`Commercial: Slot Ready: ${advert.id}`);
            advert.startLoading();
            return Promise.all([
                prebid.requestBids(advert),
                a9.requestBids(advert),
            ]);
        })
        .then(() => {
            window.googletag.display(advert.id);
        });
};

export const refreshAdvert = (advert) => {
    // advert.size contains the effective size being displayed prior to refreshing
    advert.whenSlotReady
        .then(() => {
            const prebidPromise = prebid.requestBids(advert, prebidSlot =>
                forcedSlotSize(advert, prebidSlot)
            );

            const a9Promise = a9.requestBids(advert, a9Slot =>
                forcedSlotSize(advert, a9Slot)
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
