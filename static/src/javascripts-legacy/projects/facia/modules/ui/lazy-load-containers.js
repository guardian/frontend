define([
    'fastdom',
    'qwery',
    'lib/detect',
    'lib/mediator',
    'lodash/functions/throttle'
], function (
    fastdom,
    qwery,
    detect,
    mediator,
    throttle
) {
    var distanceBeforeLoad = detect.getViewport().height;

    return function () {
        var containers = qwery('.js-container--lazy-load'),
            lazyLoad = throttle(function () {
                if (containers.length === 0) {
                    mediator.off('window:throttledScroll', lazyLoad);
                } else {
                    fastdom.read(function () {
                        var containersInRange = containers.reduce(function (result, container) {
                            result[withinRange(container) ? 'in' : 'out'].push(container);
                            return result;
                        }, { in: [], out: [] });

                        containers = containersInRange.out;

                        fastdom.write(function () {
                            containersInRange.in.forEach(displayContainer);
                        });
                    });
                }
            }, 500);

        mediator.on('window:throttledScroll', lazyLoad);
        lazyLoad();
    };

    // withinRange(Element) : Bool
    // Checks whether the element is within one screenful above or below the viewport
    function withinRange(container) {
        var top = container.nextElementSibling.getBoundingClientRect().top;
        return -distanceBeforeLoad < top && top < 2 * distanceBeforeLoad;
    }

    // displayContainer(Element) : Void
    // Removes the fc-container--lazy-load class
    function displayContainer(container) {
        container.classList.remove('fc-container--lazy-load');
    }
});
