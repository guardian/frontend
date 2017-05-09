import memoize from 'lodash/functions/memoize';
import dfpEnv from 'commercial/modules/dfp/dfp-env';
import getAdvertById from 'commercial/modules/dfp/get-advert-by-id';
var waitForAdvert = memoize(function(id) {
    return new Promise(function(resolve) {
        checkAdvert();

        function checkAdvert() {
            var advert = getAdvertById.getAdvertById(id);
            if (!advert) {
                window.setTimeout(checkAdvert, 200);
            } else {
                resolve(advert);
            }
        }
    });
});

export default waitForAdvert;
