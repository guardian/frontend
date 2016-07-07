define([
    'bonzo',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features'
], function (
    bonzo,
    Promise,
    $,
    config,
    fastdom,
    createSlot,
    commercialFeatures
) {

    function init() {

        if (!commercialFeatures.frontCommercialComponents) {
            return Promise.resolve();
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

            return fastdom.write(function () {
                $adSlotWrapper
                    .append($adSlot)
                    .insertAfter($containers[containerIndex]);
            });
        }

    }

    return {
        init: init
    };

});
