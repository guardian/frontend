define([
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/lazy-load'
], function (dfpEnv, lazyLoad) {
    var excludedAdvertIds = [
        'dfp-ad--pageskin-inread',
        'dfp-ad--merchandising-high'
    ];

    return shouldPrebidAdvert;

    function shouldPrebidAdvert(advert) {
        return dfpEnv.prebidEnabled &&
            lazyLoad.shouldLazyLoad() &&
            excludedAdvertIds.indexOf(advert.id) === -1;
    }
});
