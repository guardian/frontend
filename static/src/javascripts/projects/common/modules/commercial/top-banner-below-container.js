define([
    'bonzo',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/commercial/create-ad-slot'
], function (
    bonzo,
    $,
    config,
    detect,
    createAdSlot
) {

    function init() {
        // If you are not at front you can enjoy refreshing adfree experience
        if (typeof config.tests.topBannerPosition === 'undefined'
            || !config.page.isFront) {

            return false;
        }

        var containerIndex = 0,
            $adSlotWrapper = $.create('<div class="fc-container top-banner-below-container top-banner-ad-container top-banner-ad-container--desktop top-banner-ad-container--above-nav"></div>'),
            $containers    = $('.fc-container'),
            $adSlot        = null;

        // For mobile we want to add inline1 MPU after the first container
        if (detect.getBreakpoint() === 'mobile' && config.tests.topBannerPosition) {
            $adSlot = bonzo(createAdSlot('inline1', 'container-inline'));

            if ($containers.length > 0) {
                return $adSlot.insertAfter($containers[containerIndex]);
            }
        // For desktop we want to place topAboveNav after first container
        } else {
            $adSlot = bonzo(createAdSlot('top-above-nav', 'top-above-nav'));

            if ($containers.length >= 2) {
                return $adSlotWrapper
                    .append($adSlot)
                    .insertAfter($containers[containerIndex]);
            }
        }
    }

    return {
        init: init
    };

});
