define([
    'bonzo',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/commercial-features'
], function (
    bonzo,
    Promise,
    $,
    config,
    fastdom,
    createAdSlot,
    commercialFeatures
) {

    function init() {

        if (config.page.hasHighMerchandisingTarget) {
            return Promise.resolve();
        }

        if (!commercialFeatures.frontCommercialComponents) {
            return Promise.resolve();
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
