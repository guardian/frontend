define([
    'bonzo',
    'common/utils/$',
    'common/utils/mediator'
], function (
    bonzo,
    $,
    mediator
) {

    var adClass          = 'js-scrollable-mpu',
        updateBgPosition = function ($ad) {
            $ad.css('background-position', $ad.offset().left + 'px 0');
        };

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026567
     */
    return {

        run: function () {
            $('.' + adClass).each(function (ad) {
                var $ad = bonzo(ad);

                // update bg position
                updateBgPosition($ad);
                // to be safe, also update on window resize
                mediator.on('window:resize', function () {
                    updateBgPosition($ad);
                });

                $ad.removeClass(adClass);
            });

        }

    };

});
