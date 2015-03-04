define([
    'bonzo',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/modules/commercial/create-ad-slot'
], function (
    bonzo,
    fastdom,
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

            $adSlotWrapper.append($adSlot);

            fastdom.write(function () {
                $adSlotWrapper.insertAfter($containers[containerIndex]);
            });

            return $adSlotWrapper;
        }
    }

    return {
        init: init
    };
});
