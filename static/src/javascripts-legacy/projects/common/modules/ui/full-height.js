define([
    'lib/fastdom-promise',
    'lib/$',
    'lib/mediator',
    'lib/detect'
], function (
    fastdomPromise,
    $,
    mediator,
    detect
) {
    // Helper for full height elements as 100vh on mobile Chrome and Safari
    // changes as the url bar slides in and out
    // http://code.google.com/p/chromium/issues/detail?id=428132

    var renderBlock = function (state) {
        return fastdomPromise.mutate(function () {
            state.$el.css('height', '');
        }).then(function () {
            if (state.isMobile) {
                return fastdomPromise.measure(function () {
                    return state.$el.height();
                }).then(function (height) {
                    return fastdomPromise.mutate(function () {
                        state.$el.css('height', height);
                    });
                });
            }
        });
    };

    var render = function (state) {
        state.elements.each(function (element) {
            renderBlock({ $el: $(element), isMobile: state.isMobile });
        });
    };

    var getState = function () {
        return fastdomPromise.measure(function () {
            var elements = $('.js-is-fixed-height');
            return { elements: elements, isMobile: detect.getBreakpoint() === 'mobile' };
        });
    };

    var onViewportChange = function () {
        getState().then(render);
    };

    var init = function () {
        mediator.on('window:throttledResize', onViewportChange);
        mediator.on('window:orientationchange', onViewportChange);
        onViewportChange();
    };


    return {
        init: init
    };
});
