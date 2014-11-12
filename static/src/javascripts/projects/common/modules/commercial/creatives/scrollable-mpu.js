define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bean,
    bonzo,
    $,
    detect,
    mediator
) {

    var adClass = 'js-scrollable-mpu',
        /**
         * TODO: rather blunt instrument this - due to the fact *most* mobile devices have a crappy onscroll
         * implementation, i.e. it only fires on scroll end
         */
        badOnScroll = detect.isIOS() || detect.isAndroid(),
        updateStyle = function (ad, backgroundImageOrigin) {
            var backgroundPositionY = window.pageYOffset + backgroundImageOrigin;
            ad.style.backgroundPosition = '0 ' + backgroundPositionY + 'px';
        };

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026567
     */
    return {

        run: function () {

            $('.' + adClass).each(function (ad) {
                var backgroundImageOrigin,
                    $ad = bonzo(ad);

                if (badOnScroll) {
                    $ad.css('background-image', $ad.data('static-image'));
                } else {
                    backgroundImageOrigin = bonzo.viewport().height - $ad.offset().top - $ad.offset().height;
                    updateStyle(ad, backgroundImageOrigin);
                    mediator.on('window:scroll', updateStyle.bind(null, ad, backgroundImageOrigin));
                }
                $ad.removeClass(adClass);
            });

        }

    };

});
