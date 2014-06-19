define([
    'bonzo',
    'common/$',
    'lodash/functions/once',
    'common/modules/adverts/dfp'
], function (
    bonzo,
    $,
    once,
    dfp
) {

    return {

        init: once(function(config) {
            if (config.page.isFront && !config.page.hasPageSkin) {
                var $adSlot = bonzo(dfp.createAdSlot('merchandising-high', 'commercial-component-high')),
                    $containers = $('.container');
                if ($containers.length < 4) {
                    return $adSlot.insertAfter($containers[0]);
                } else {
                    return $adSlot.insertAfter($containers[2]);
                }
            }
        })

    };

});
