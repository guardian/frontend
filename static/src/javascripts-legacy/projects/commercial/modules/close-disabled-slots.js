define([
    'bonzo',
    'qwery',
    'Promise',
    'common/utils/$css',
    'common/utils/fastdom-promise'
], function (
    bonzo,
    qwery,
    Promise,
    $css,
    fastdom
) {
    var adSlotSelector = '.js-ad-slot';

    return {
        init: init
    };

    function init(force) {

        // Get all ad slots
        var $adSlots = qwery(adSlotSelector)
            // convert them to bonzo objects
            .map(bonzo);

        if (!force) {
            // remove the ones which should not be there
            $adSlots = $adSlots.filter(shouldDisableAdSlot);
        }

        var modulePromises = $adSlots.map(function ($adSlot){
            return fastdom.write(function () {
                $adSlot.remove();
            });
        });

        return Promise.all(modulePromises);
    }

    function shouldDisableAdSlot($adSlot) {
        return $css($adSlot, 'display') === 'none';
    }
});
