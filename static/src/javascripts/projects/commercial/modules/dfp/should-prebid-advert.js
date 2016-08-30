define([
    'commercial/modules/dfp/dfp-env'
], function (dfpEnv) {
    var excludedAdvertIds = [
        'dfp-ad--pageskin-inread',
        'dfp-ad--merchandising-high'
    ];

    return shouldPrebidAdvert;

    function shouldPrebidAdvert(advert) {
        return dfpEnv.prebidEnabled &&
            dfpEnv.shouldLazyLoad() &&
            excludedAdvertIds.indexOf(advert.id) === -1;
    }
});
