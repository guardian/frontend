define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$css',
    'common/utils/fastdom-promise',
    'common/modules/commercial/commercial-features',
    'common/utils/config',
    'common/modules/commercial/user-features',
    'commercial/modules/dfp/performance-logging'
], function (
    bonzo,
    qwery,
    Promise,
    $css,
    fastdom,
    commercialFeatures,
    config,
    userFeatures,
    performanceLogging
) {
    var adSlotSelector = '.js-ad-slot';

    return {
        init: init
    };

    function init(moduleName) {

        performanceLogging.moduleStart(moduleName);

        var modulePromises = [];

        // Get all ad slots
        qwery(adSlotSelector)
            // convert them to bonzo objects
            .map(bonzo)
            // remove the ones which should not be there
            .filter(function ($adSlot) {
                // filter out (and remove) hidden ads
                return shouldDisableAdSlot($adSlot);
            })
            .forEach(function ($adSlot){
                modulePromises.push(
                    fastdom.write(function () {
                        $adSlot.remove();
                    })
                );
            });

        return Promise.all(modulePromises)
        .then(performanceLogging.moduleEnd.bind(null, moduleName));
    }

    function shouldDisableAdSlot($adSlot) {
        return isAdfreeUser() || isVisuallyHidden() || isDisabledCommercialFeature();

        function isVisuallyHidden() {
            return $css($adSlot, 'display') === 'none';
        }

        function isDisabledCommercialFeature() {
            return !commercialFeatures.topBannerAd && $adSlot.data('name') === 'top-above-nav';
        }

        function isAdfreeUser() {
            return config.switches.adFreeMembershipTrial && userFeatures.isAdFreeUser();
        }
    }

});
