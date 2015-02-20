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

    function saveNumOpen(numOpen) {
        return storage.session.set(storageKey, {
            pathname: window.location.pathname,
            openContainers: numOpen
        });
    }

    function loadNumPreviouslyOpen() {
        var state = storage.session.get(storageKey);

        return state && state.pathname === window.location.pathname && state.openContainers > 0 ? state.openContainers : 0;
    }

    function revealContainer(container) {
        bonzo(container).removeClass('fc-container--lazy-load');
    }

    return function () {
        var $frontBottom = bonzo(qwery('.js-front-bottom')),
            lazies = qwery('.js-container--lazy-load'),
            numOpen = qwery('.fc-container').length - lazies.length,
            numPreviouslyOpen,
            lazyLoad;

        if (lazies.length) {
            numPreviouslyOpen = loadNumPreviouslyOpen();
            lazies.splice(0, numPreviouslyOpen - numOpen - 1);
            numOpen = Math.max(numOpen, numPreviouslyOpen);

            if (lazies.length) {
                lazyLoad = _.throttle(function () {
                    if (lazies.length === 0) {
                        mediator.off('window:scroll', lazyLoad);
                    } else {
                        fastdom.read(function () {
                            var scrollTop = bonzo(document.body).scrollTop(),
                                scrollBottom = scrollTop + bonzo.viewport().height,
                                bottomOffset = $frontBottom.offset().top;

                            if (scrollBottom > bottomOffset - distanceBeforeLoad) {
                                fastdom.write(function () {
                                    revealContainer(lazies.shift());
                                    numOpen += 1;
                                    saveNumOpen(numOpen);
                                });
                            }
                        });
                    }
                }, 200);

                mediator.on('window:scroll', lazyLoad);
                lazyLoad();
            }
        }
    };
});
