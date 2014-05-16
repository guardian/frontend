define([
    'common/$',
    'lodash/functions/once'
], function (
    $,
    once
) {

    var adSlot =
        '<div class="ad-slot ad-slot--dfp ad-slot--commercial-component-high" data-link-name="ad slot merchandising-high" data-name="merchandising-high" data-label="false" data-refresh="false" data-desktop="888,88">' +
            '<div id="dfp-ad--merchandising-high" class="ad-slot__container"></div>' +
        '</div>';

    return {

        init: once(function() {
            var $containers = $('.facia-container section.container');
            if($containers.length < 4) {
                return $containers.first().after(adSlot);
            }
        })

    };

});
