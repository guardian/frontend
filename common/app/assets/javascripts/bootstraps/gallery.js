define([
    'common/utils/mediator',
    'common/utils/$',
    'bean'
], function(
    mediator,
    $,
    bean
) {

    var verticalHeightCss = function() {
        $('.js-vh-polyfill').css('max-height', '90vh');
    };

    var safariVerticalHeightPolyfill = function() {
        var setHeight = function() {
            $('.js-vh-polyfill').css('max-height', window.innerHeight * 0.9);
        };
        setHeight();
        bean.on(window, 'resize', setHeight);
        bean.on(window, 'orientationchange', setHeight);
    };

    var ready = function (config, context) {
        (window.navigator.userAgent.match(/(Safari)/)) ? safariVerticalHeightPolyfill() : verticalHeightCss();
        $('.js-delayed-image-upgrade').removeClass('js-delayed-image-upgrade').addClass('js-image-upgrade');
        mediator.emit('ui:images:upgrade');

        mediator.emit('page:gallery:ready', config, context);
    };

    return {
        init: ready
    };

});
