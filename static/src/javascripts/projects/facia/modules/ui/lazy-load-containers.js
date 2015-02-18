define([
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/_',
    'common/utils/mediator'
], function (
    bonzo,
    fastdom,
    qwery,
    _,
    mediator
) {
    var DISTANCE_BEFORE_LOAD = 100;

    return function () {
        var $frontBottom = bonzo(qwery('.js-front-bottom')),
            containers = qwery('.js-container--lazy-load'),
            lazyLoad = _.throttle(function () {
                if (containers.length === 0) {
                    mediator.off('window:scroll', lazyLoad);
                } else {
                    fastdom.read(function () {
                        var scrollTop = bonzo(document.body).scrollTop(),
                            scrollBottom = scrollTop + bonzo.viewport().height,
                            bottomOffset = $frontBottom.offset().top,
                            $container;

                        if (scrollBottom > bottomOffset - DISTANCE_BEFORE_LOAD) {
                            $container = bonzo(containers.shift());

                            fastdom.write(function () {
                                $container.removeClass('fc-container--lazy-load');
                            });
                        }
                    });
                }
            }, 200);

        mediator.on('window:scroll', lazyLoad);
        lazyLoad();
    };
});
