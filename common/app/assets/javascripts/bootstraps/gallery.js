define([
    'common/utils/mediator',
    'common/utils/$',
    'bonzo'
], function(
    mediator,
    $,
    bonzo
) {

    var verticallyResponsiveImages = function() {
        var setHeight = function() {
            var $imgs = $('.js-vh-images'),
                min = 300, // stops images getting too small
                max = $imgs.parent().dim().width, // portrait images shouldn't be taller than landscapes are wide
                maxHeight = Math.max(min, Math.min(max, window.innerHeight * 0.9));
            $imgs.css('max-height', maxHeight);
        };
        setHeight();
        mediator.addListeners({
            'window:resize': setHeight,
            'window:orientationchange': setHeight
        });
    };

    var lightboxImageLinks = function() {
        // override the no-js href with the js lightbox href
        $('.js-gallery-img-container').each(function(el) {
            var $el = bonzo(el),
                href = $el.attr('data-js-href');
            $el.attr('href', href);
            $el.attr('target', '');
        });
    };

    var enableImager = function() {
        $('.js-gallery-img-container').addClass('js-image-upgrade');
        mediator.emit('ui:images:upgrade', $('.gallery2')[0]);
    };

    var ready = function (config, context) {
        verticallyResponsiveImages();
        enableImager();
        lightboxImageLinks();

        mediator.emit('page:gallery:ready', config, context);
    };

    return {
        init: ready
    };

});
