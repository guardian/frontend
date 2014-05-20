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

        init: once(function() {
            var $containers = $('.facia-container section.container');
            if($containers.length < 4) {
                return $containers.first().after(dfp('merchandising-high', 'commercial-component-high'));
            }
        })

    };

});
