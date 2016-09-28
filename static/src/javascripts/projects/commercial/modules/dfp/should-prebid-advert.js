define([
    'common/utils/config',
    'commercial/modules/dfp/dfp-env'
], function (config, dfpEnv) {
    var excludedAdvertIds = [
        'dfp-ad--pageskin-inread',
        'dfp-ad--merchandising-high'
    ];

    return shouldPrebidAdvert;

    function shouldPrebidAdvert(advert) {

        var participatingInSonobi = 'tests' in config && config.tests.commercialHbSonobi;

        return !participatingInSonobi &&
            dfpEnv.prebidEnabled &&
            dfpEnv.shouldLazyLoad() &&
            excludedAdvertIds.indexOf(advert.id) === -1;
    }
});
