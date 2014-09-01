define([
    'common/utils/mediator',
    'common/utils/$'
], function(
    mediator,
    $
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
