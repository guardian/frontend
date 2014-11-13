define([
    'bonzo',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bonzo,
    $,
    detect,
    mediator
) {

    var adClass = 'js-scrollable-mpu',
        /**
         * TODO: rather blunt instrument this, due to the fact *most* mobile devices don't have a fixed
         * background-attachment - need to make this more granular
         */
        limitedBgAttachment = detect.isIOS() || detect.isAndroid(),
        updateBgPosition    = function ($ad) {
            $ad.css('background-position', $ad.offset().left + 'px 100%');
        };

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026567
     */
    return {

        run: function () {
            $('.' + adClass).each(function (ad) {
                var staticImage,
                    $ad = bonzo(ad);

                if (limitedBgAttachment) {
                    staticImage = $ad.data('static-image');
                    $ad.css('background-image', staticImage);
                } else {
                    $ad.css('background-attachment', 'fixed');
                    // update bg position
                    updateBgPosition($ad);
                    // to be safe, also update on window resize
                    mediator.on('window:resize', function () {
                        updateBgPosition($ad);
                    });
                }

                $ad.removeClass(adClass);
            });

        }

    };

});
