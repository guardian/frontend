define([
    'bonzo',
    'lodash/main',
    'common/utils/mediator'
], function(
    bonzo,
    _,
    mediator
) {

    var lazyLoaders = [],
        doLazyLoadersThrottled = _.throttle(doLazyLoaders, 200, {leading: false, trailing: true});

    function addLazyLoader(conditionFn, loadFn) {
        // calls `loadFn` when `conditionFn` is true
        lazyLoaders.push({conditionFn: conditionFn, loadFn: loadFn});
        if (lazyLoaders.length === 1) {
            mediator.on('window:scroll', doLazyLoadersThrottled);
        }
    }

    function addScrollingLazyLoader(el, distanceThreshold, loadFn) {
        // calls `loadFn` when `scrollTop` is within `distanceThreshold` of `el`
        var $el = bonzo(el),
            conditionFn = function() {
                var scrollTop = bonzo(document.body).scrollTop(),
                    elOffset = $el.offset(),
                    loadAfter = elOffset.top - distanceThreshold,
                    loadBefore = elOffset.top + elOffset.height + distanceThreshold;
                return scrollTop > loadAfter && scrollTop < loadBefore;
            };
        addLazyLoader(conditionFn, loadFn);
    }

    function doLazyLoaders() {
        var loaded = _.filter(lazyLoaders, function(lazyLoader) {
            if (lazyLoader.conditionFn()) {
                lazyLoader.loadFn();
                return true;
            }
        });
        lazyLoaders = _.difference(lazyLoaders, loaded);
        if (lazyLoaders.length === 0) {
            mediator.off('window:scroll', doLazyLoadersThrottled);
        }
    }

    return {
        add: addLazyLoader,
        addScrolling: addScrollingLazyLoader
    }
});
