define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$css',
    'common/utils/fastdom-promise',
    'common/modules/commercial/commercial-features'
], function (
    bonzo,
    qwery,
    Promise,
    $css,
    fastdom,
    commercialFeatures
) {
    var adSlotSelector = '.js-ad-slot';

    return {
        init: init
    };

    function init() {

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

        return Promise.all(modulePromises);
    }

    function shouldDisableAdSlot($adSlot) {
        return isVisuallyHidden() || isDisabledCommercialFeature();

        function isVisuallyHidden() {
            return $css($adSlot, 'display') === 'none';
        }

        function isDisabledCommercialFeature() {
            return !commercialFeatures.topBannerAd && $adSlot.data('name') === 'top-above-nav';
        }
    }

});
