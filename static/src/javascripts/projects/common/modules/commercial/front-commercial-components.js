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

        var $adSlot     = bonzo(dfp.createAdSlot('merchandising-high', 'commercial-component-high')),
            $containers = $('.container');
        if ($containers.length >= 4) {
            return $adSlot.insertAfter($containers[2]);
        } else if ($containers.length >= 2) {
            return $adSlot.insertAfter($containers[0]);
        }
    }

    return {

        init: once(init)

    };

});
