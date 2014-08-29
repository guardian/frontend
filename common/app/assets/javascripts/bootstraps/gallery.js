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
            $('.js-vh-images').css('max-height', window.innerHeight * 0.9);
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
