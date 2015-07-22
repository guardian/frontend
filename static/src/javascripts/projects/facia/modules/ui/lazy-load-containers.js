define([
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bonzo,
    fastdom,
    qwery,
    _,
    detect,
    mediator
) {
    var distanceBeforeLoad = detect.getViewport().height;

    return function () {
        var $frontBottom = bonzo(qwery('.js-front-bottom')),
            containers = qwery('.js-container--lazy-load'),
            lazyLoad = function (scrollTop) {
                if (containers.length === 0) {
                    mediator.off('window:throttledScroll', lazyLoad);
                } else {
                    fastdom.read(function () {
                        var scrollBottom = scrollTop + bonzo.viewport().height,
                            bottomOffset = $frontBottom.offset().top,
                            $container;

                        if (scrollBottom > bottomOffset - distanceBeforeLoad) {
                            $container = bonzo(containers.shift());

                            fastdom.write(function () {
                                $container.removeClass('fc-container--lazy-load');
                            });
                        }
                    });
                }
            };

        mediator.on('window:throttledScroll', lazyLoad);
        lazyLoad(window.pageYOffset);
    };
});
