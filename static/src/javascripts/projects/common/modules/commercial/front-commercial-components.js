define([
    'bonzo',
    'common/utils/$',
    'common/utils/config',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features'
], function (
    bonzo,
    $,
    config,
    createSlot,
    commercialFeatures
) {

    function init() {

        if (config.page.hasHighMerchandisingTarget) {
         return false;
        }

        if (!commercialFeatures.frontCommercialComponents) {
            return false;
        }

        var containerIndex,
            $adSlotWrapper = $.create('<div class="fc-container"></div>'),
            $adSlot        = bonzo(createSlot('merchandising-high', 'commercial-component-high')),
            $containers    = $('.fc-container');

        if ($containers.length >= 2) {
            containerIndex = 0;

            if ($containers.length >= 4) {
                containerIndex = config.page.contentType === 'Network Front' ? 3 : 2;
            }

            return $adSlotWrapper
                .append($adSlot)
                .insertAfter($containers[containerIndex]);
        }

    }

    return {
        init: init
    };

});
