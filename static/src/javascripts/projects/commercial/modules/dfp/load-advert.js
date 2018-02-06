// @flow
import { Advert } from 'commercial/modules/dfp/Advert';
import { prebid } from 'commercial/modules/prebid/prebid';

export const loadAdvert = (advert: Advert, refresh: boolean = false): void => {
    advert.whenSlotReady
        .catch(() => {
            // The display needs to be called, even in the event of an error.
        })
        .then(() => {
            advert.startLoading();
            return prebid.requestBids(advert);
        })
        .then(() => {
            if (refresh) {
                window.googletag.pubads().refresh([advert.slot]);
            } else {
                window.googletag.display(advert.id);
            }
        });
};
