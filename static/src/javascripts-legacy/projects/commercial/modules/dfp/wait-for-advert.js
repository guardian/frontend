define([
    'lodash/functions/memoize',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/get-advert-by-id'
], function (memoize, dfpEnv, getAdvertById) {
    var waitForAdvert = memoize(function (id) {
        return new Promise(function (resolve) {
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

    return waitForAdvert;
});
