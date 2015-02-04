define([
    'bonzo',
    'lodash/main',
    'common/utils/mediator'
], function (
    bonzo,
    _,
    mediator
) {

    var lazyLoaders = [],
        scrollTop = 0, getScrollTop = function () { return scrollTop; },
        doLazyLoadersThrottled, doLazyLoadersDebounced,
        doLazyLoaders = function () {
            scrollTop = bonzo(document.body).scrollTop();
            lazyLoaders = _.filter(lazyLoaders, function (lazyLoader) {
                if (lazyLoader.conditionFn()) {
                    lazyLoader.loadFn();
                } else {
                    return true;
                }
            });
            if (lazyLoaders.length === 0) {
                mediator.off('window:scroll', doLazyLoadersThrottled);
            }
        };

    doLazyLoadersThrottled = _.throttle(doLazyLoaders, 200, {leading: false, trailing: true});
    doLazyLoadersDebounced = _.debounce(doLazyLoaders, 2000); // used on load for edge-case where user doesn't scroll

    function addLazyLoader(conditionFn, loadFn) {
        // calls `loadFn` when `conditionFn` is true
        var lazyLoader = {conditionFn: conditionFn, loadFn: loadFn};
        lazyLoaders.push(lazyLoader);
        if (lazyLoaders.length === 1) {
            mediator.on('window:scroll', doLazyLoadersThrottled);
        }
        doLazyLoadersDebounced();
    }

    function addScrollingLazyLoader(el, distanceThreshold, loadFn) {
        // calls `loadFn` when `scrollTop` is within `distanceThreshold` of `el`
        var $el = bonzo(el),
            conditionFn = function () {
                var scrollTop = getScrollTop(),
                    elOffset = $el.offset(),
                    loadAfter = elOffset.top - distanceThreshold,
                    loadBefore = elOffset.top + elOffset.height + distanceThreshold;
                return scrollTop > loadAfter && scrollTop < loadBefore;
            };
        addLazyLoader(conditionFn, loadFn);
    }

    return {
        add: addLazyLoader,
        addScrolling: addScrollingLazyLoader
    };
});
