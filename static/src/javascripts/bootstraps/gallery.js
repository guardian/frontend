define([
    'common/utils/mediator',
    'common/utils/$',
    'common/utils/config',
    'common/modules/component',
    'common/modules/gallery/lightbox',
    'common/modules/ui/blockSharing',
    'lodash/collections/forEach',
    'bonzo',
    'qwery',
    'bean'
], function (
    mediator,
    $,
    config,
    Component,
    LightboxGallery,
    BlockSharing,
    forEach,
    bonzo,
    qwery,
    bean
) {

    var verticallyResponsiveImages = function () {

            var setHeight = function () {
                if (!bonzo(document.body).hasClass('has-overlay')) {
                    var $imgs = $('.js-gallery-img'),
                        min = 300, // stops images getting too small
                        max = $imgs.parent().dim().width, // portrait images shouldn't be taller than landscapes are wide
                        height = Math.max(min, Math.min(max, window.innerHeight * 0.9));
                    $imgs.css('max-height', height);

                    // Portrait containers use padding-bottom to set the height of the container prior to upgrading.
                    // This needs to be synchronised with the new image height.
                    $('.gallery2__img-container--portrait').css('padding-bottom', height);
                }
            };

            setHeight();
            mediator.addListeners({
                'window:resize': setHeight,
                'window:orientationchange': setHeight,
                'ui:images:vh': setHeight
            });
        },

        transcludeMostPopular = function () {
            var mostViewed = new Component(),
                container = qwery('.js-gallery-most-popular')[0];

            mostViewed.manipulationType = 'html';
            mostViewed.endpoint = '/gallery/most-viewed.json';
            mostViewed.ready = function () {
                mediator.emit('ui:images:upgrade', container);
            };
            mostViewed.fetch(container, 'html');
        },
        ready = function (config) {
            LightboxGallery.init();
            BlockSharing.init();
            verticallyResponsiveImages();
            $('.js-delayed-image-upgrade').removeClass('js-delayed-image-upgrade').addClass('js-image-upgrade');

            forEach(qwery('.js-gallery-img.responsive-img'), function (responsiveImage) {
                bean.one(responsiveImage, 'load', function (e) {
                    bonzo(e.currentTarget).removeClass('u-h').previous().hide();
                });
            });

            mediator.emit('ui:images:upgrade', $('.gallery2')[0]);

            mediator.emit('page:gallery:ready', config);
            transcludeMostPopular();
        }


    return {
        init: ready
    };

});
