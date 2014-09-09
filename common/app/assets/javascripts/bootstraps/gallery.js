define([
    'common/utils/mediator',
    'common/utils/$',
    'common/utils/config',
    'common/modules/component',
    'bonzo',
    'qwery'
], function(
    mediator,
    $,
    config,
    Component,
    bonzo,
    qwery
) {

    var verticallyResponsiveImages = function() {

        var setHeight = function() {
            if (!bonzo(document.body).hasClass('has-overlay')) {
                var $imgs = $('.js-gallery-img'),
                    min = 300, // stops images getting too small
                    max = $imgs.parent().dim().width, // portrait images shouldn't be taller than landscapes are wide
                    maxHeight = Math.max(min, Math.min(max, window.innerHeight * 0.9));
                $imgs.css('max-height', maxHeight);
            }
        };

        setHeight();
        mediator.addListeners({
            'window:resize': setHeight,
            'window:orientationchange': setHeight,
            'ui:images:vh': setHeight
        });
    };

    var transcludeMostPopular = function() {

        if (config.page.section === 'childrens-books-site') {
            $('.js-gallery-most-popular').addClass('u-h');
        } else {
            var mostViewed = new Component(),
                container = qwery('.js-gallery-most-popular')[0];

            mostViewed.manipulationType = 'html';
            mostViewed.endpoint = '/gallery/most-viewed.json';
            mostViewed.ready = function () {
                mediator.emit('ui:images:upgrade', container);
            };
            mostViewed.fetch(container, 'html');
        }
    };

    var ready = function (config) {
        verticallyResponsiveImages();
        $('.js-delayed-image-upgrade').removeClass('js-delayed-image-upgrade').addClass('js-image-upgrade');
        mediator.emit('ui:images:upgrade', $('.gallery2')[0]);

        mediator.emit('page:gallery:ready', config);
    };

    return {
        init: ready
    };

});
