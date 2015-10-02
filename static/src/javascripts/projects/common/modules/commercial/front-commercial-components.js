define([
    'bonzo',
    'common/utils/$',
    'common/utils/config',
    'common/modules/commercial/create-ad-slot'
], function (
    bonzo,
    $,
    config,
    createAdSlot
) {

    function init() {
        if (!config.switches.commercialComponents || !config.page.isFront) {
            return false;
        }

        var containerIndex,
            $adSlotWrapper = $.create('<div class="fc-container"></div>'),
            $adSlot        = bonzo(createAdSlot('merchandising-high', 'commercial-component-high')),
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
