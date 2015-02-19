define([
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/mediator'
], function (
    bonzo,
    fastdom,
    qwery,
    _,
    detect,
    storage,
    mediator
) {
    var storageKey = 'gu.front.lazystate',
        distanceBeforeLoad = detect.getViewport().height;

    function saveState(numOpenContainers) {
        return storage.session.set(storageKey, {
            pathname: window.location.pathname,
            openContainers: numOpenContainers
        });
    }

    function isHidden(el) {
        return el.offsetParent === null;
    }

    function revealContainer(container) {
        if (isHidden(container)) {
            bonzo(container).removeClass('fc-container--lazy-load');
            return true;
        }
    }

    return function () {
        var $frontBottom = bonzo(qwery('.js-front-bottom')),
            lazyContainers = qwery('.js-container--lazy-load'),
            numOpenContainers = qwery('section').length - lazyContainers.length,
            lazyLoad = _.throttle(function () {
                if (lazyContainers.length === 0) {
                    mediator.off('window:scroll', lazyLoad);
                } else {
                    fastdom.read(function () {
                        var scrollTop = bonzo(document.body).scrollTop(),
                            scrollBottom = scrollTop + bonzo.viewport().height,
                            bottomOffset = $frontBottom.offset().top;

                        if (scrollBottom > bottomOffset - distanceBeforeLoad) {
                            fastdom.write(function () {
                                numOpenContainers += 1;
                                while (!revealContainer(lazyContainers.shift())) {
                                    numOpenContainers += 1;
                                }
                                saveState(numOpenContainers);
                            });
                        }
                    });
                }
            }, 200);

        mediator.on('window:scroll', lazyLoad);
        lazyLoad();
    };
});
