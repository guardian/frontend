define([
    'Promise',
    'lodash/functions/memoize',
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/get-advert-by-id'
], function (Promise, memoize, dfpEnv, getAdvertById) {
    dfpEnv.fn.waitForAdvert = memoize(function (id) {
        return new Promise(function (resolve) {
            checkAdvert();
            function checkAdvert() {
                var advert = getAdvertById(id);
                if (!advert) {
                    window.setTimeout(checkAdvert, 200);
                } else {
                    resolve(advert);
                }
            }
        });
    });

    return dfpEnv.fn.waitForAdvert;
});
