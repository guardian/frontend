define([
    'bonzo',
    'common/utils/$',
    'common/utils/config',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features'
], function (
    bonzo,
    $,
    config,
    createAdSlot,
    commercialFeatures
) {

    function init() {
        if (!config.tests.topBannerPosition && !config.page.isFront) {
            return false;
        }

        var containerIndex,
            $adSlotWrapper = $.create('<div class="fc-container"></div>'),
            $adSlot        = bonzo(createAdSlot('front-large', 'front-large')),
            $containers    = $('.fc-container');

        if ($containers.length >= 2) {
            containerIndex = 0;

            return $adSlotWrapper
                .append($adSlot)
                .insertAfter($containers[containerIndex]);
        }

    }

    return {
        init: init
    };

});
