// @flow
import Advert from 'commercial/modules/dfp/Advert';

const loadAdvert = (advert: Advert): void => {
    advert.whenSlotReady
        .catch(() => {
            // The display needs to be called, even in the event of an error.
        })
        .then(() => {
            advert.startLoading();
            window.googletag.display(advert.id);
        });
};

export default loadAdvert;
