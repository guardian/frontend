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
            lazyLoad = _.throttle(function () {
                if (containers.length === 0) {
                    mediator.off('window:throttledScroll', lazyLoad);
                } else {
                    fastdom.read(function () {
                        var scrollTop = window.pageYOffset,
                            scrollBottom = scrollTop + bonzo.viewport().height,
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
            }, 500);

        mediator.on('window:throttledScroll', lazyLoad);
        lazyLoad();
    };
});
