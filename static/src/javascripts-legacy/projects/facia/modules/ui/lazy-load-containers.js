define([
    'fastdom',
    'qwery',
    'common/utils/detect',
    'common/utils/mediator',
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
                        var cs = split(containers, withinRange);

                        containers = cs[1];

                        fastdom.write(function () {
                            cs[0].forEach(displayContainer);
                        });
                    });
                }
            }, 500);

        mediator.on('window:throttledScroll', lazyLoad);
        lazyLoad();
    };

    // split :: [Element] -> (Element -> Bool) -> ([Element], [Element])
    // invariant: { inA all fn ^ outA all (complement fn) | (inA, outA) = split xs fn }
    function split(arr, testFn) {
        var i = 0, ii = arr.length;
        var result = [[], []];
        while (i < ii) {
            if (testFn(arr[i])) {
                result[0].push(arr[i]);
            } else {
                result[1].push(arr[i]);
            }
            i++;
        }

        return result;
    }

    function withinRange(container) {
        var top = container.nextElementSibling.getBoundingClientRect().top;
        return -distanceBeforeLoad < top && top < 2 * distanceBeforeLoad;
    }

    function displayContainer(container) {
        container.classList.remove('fc-container--lazy-load');
    }
});
