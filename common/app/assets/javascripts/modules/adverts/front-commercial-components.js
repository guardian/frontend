define([
    'common/$',
    'lodash/functions/once',
    'common/modules/adverts/dfp'
], function (
    $,
    once,
    dfp
) {

    return {

        init: once(function(config) {
            var $containers = $('.facia-container section.container');
            if($containers.length < 4 && !config.page.hasPageSkin) {
                return $containers.first().after(dfp.createAdSlot('merchandising-high', 'commercial-component-high'));
            }
        })

    };

});
