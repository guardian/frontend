define([
    'common/utils/mediator',
    'common/utils/$'
], function(
    mediator,
    $
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

    var ready = function (config, context) {
        verticallyResponsiveImages();
        $('.js-delayed-image-upgrade').removeClass('js-delayed-image-upgrade').addClass('js-image-upgrade');
        mediator.emit('ui:images:upgrade', $('.gallery2')[0]);

        mediator.emit('page:gallery:ready', config, context);
    };

    return {
        init: ready
    };

});
