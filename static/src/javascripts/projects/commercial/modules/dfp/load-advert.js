import dfpEnv from 'commercial/modules/dfp/dfp-env';
import Advert from 'commercial/modules/dfp/Advert';
export default loadAdvert;

function loadAdvert(advert) {
    advert.whenSlotReady
        .catch(function() {
            // The display needs to be called, even in the event of an error.
        })
        .then(function() {
            Advert.startLoading(advert);
            window.googletag.display(advert.id);
        });
}
