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
        badOnScroll = detect.isIOS() || detect.isAndroid();

    /**
     * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10026567
     */
    return {

        init: function () {

            $('.' + adClass).each(function (ad) {
                var staticImage,
                    $ad = bonzo(ad);

                if (badOnScroll) {
                    staticImage = $ad.data('static-image');
                    $ad.css('background-image', staticImage);
                } else {
                    mediator.on('window:scroll', function () {
                        ad.style.backgroundPosition = '0 ' + window.pageYOffset + 'px';
                    });
                }
                $ad.removeClass(adClass);
            });

        }

    };

});
