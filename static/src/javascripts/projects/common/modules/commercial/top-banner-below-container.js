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
        if (typeof config.tests.topBannerPosition === 'undefined'
            || !config.page.isFront
            || detect.getBreakpoint() === 'mobile') {

            return false;
        }

        var containerIndex = 0,
            $adSlotWrapper = $.create('<div class="fc-container top-banner-below-container top-banner-ad-container top-banner-ad-container--desktop top-banner-ad-container--above-nav"></div>'),
            $adSlot        = bonzo(createAdSlot('top-above-nav', 'top-above-nav')),
            $containers    = $('.fc-container');

        if ($containers.length >= 2) {
            return $adSlotWrapper
                .append($adSlot)
                .insertAfter($containers[containerIndex]);
        }

    }

    return {
        init: init
    };

});
