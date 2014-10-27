define([
    'bonzo',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/config',
    'common/modules/commercial/dfp'
], function (
    bonzo,
    once,
    $,
    config,
    dfp
) {

    function init() {
        if (!config.switches.commercialComponents || !config.page.isFront || config.page.hasPageSkin) {
            return false;
        }

        var containerIndex,
            $adSlot     = bonzo(dfp.createAdSlot('merchandising-high', 'commercial-component-high')),
            $containers = $('.container');

        if ($containers.length >= 2) {
            containerIndex = 0;

            if ($containers.length >= 4) {
                containerIndex = config.page.contentType === 'Network Front' ? 3 : 2;
            }

            return $adSlot.insertAfter($containers[containerIndex]);
        }

    }

    return {

        init: once(init)

    };

});
