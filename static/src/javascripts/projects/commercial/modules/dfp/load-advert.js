// @flow
import { Advert } from 'commercial/modules/dfp/Advert';
import { prebid } from 'commercial/modules/prebid/prebid';

export const loadAdvert = (advert: Advert): void => {
    advert.whenSlotReady
        .catch(() => {
            // The display needs to be called, even in the event of an error.
        })
        .then(() => {
            advert.startLoading();
            return prebid.requestBids(advert);
        })
        .then(() => window.googletag.display(advert.id));
};

export const refreshAdvert = (advert: Advert): void => {
    advert.whenSlotReady.then(() => prebid.requestBids(advert)).then(() => {
        advert.slot.setTargeting('refreshed', 'true');
        window.googletag.pubads().refresh([advert.slot]);
    });
};
