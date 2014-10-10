define([
    'bonzo',
    'lodash/objects/defaults',
    'lodash/functions/once',
    'common/utils/$',
    'common/utils/config',
    'common/modules/commercial/dfp'
], function (
    bonzo,
    defaults,
    once,
    $,
    globalConfig,
    dfp
) {

    function init(c) {
        var $adSlot, $containers,
            config = defaults(
            c || {},
            globalConfig,
            {
                switches: {},
                page: {}
            }
        );

        if (!config.switches.commercialComponents || !config.page.isFront || config.page.hasPageSkin) {
            return false;
        }

        $adSlot     = bonzo(dfp.createAdSlot('merchandising-high', 'commercial-component-high'));
        $containers = $('.container');
        if ($containers.length >= 4) {
            return $adSlot.insertAfter($containers[1]);
        } else if ($containers.length >= 2) {
            return $adSlot.insertAfter($containers[0]);
        }
    }

    return {

        init: once(init),

        // for testing
        reset: function () {
            this.init = once(init);
        }

    };

});
