define([
    'bonzo',
    'lodash/main',
    'common/utils/mediator'
], function (
    bonzo,
    _,
    mediator
) {

    var items = [],
        scrollTop = 0, getScrollTop = function () { return scrollTop; },
        doProximityLoadingThrottled, doProximityLoadingDebounced,
        doProximityLoading = function () {
            scrollTop = bonzo(document.body).scrollTop();
            items = _.filter(items, function (item) {
                if (item.conditionFn()) {
                    item.loadFn();
                } else {
                    return true;
                }
            });
            if (items.length === 0) {
                mediator.off('window:scroll', doProximityLoadingThrottled);
            }
        };

    doProximityLoadingThrottled = _.throttle(doProximityLoading, 200, {leading: false, trailing: true});
    doProximityLoadingDebounced = _.debounce(doProximityLoading, 2000); // used on load for edge-case where user doesn't scroll

    function addItem(conditionFn, loadFn) {
        // calls `loadFn` when `conditionFn` is true
        var item = {conditionFn: conditionFn, loadFn: loadFn};
        items.push(item);
        if (items.length === 1) {
            mediator.on('window:scroll', doProximityLoadingThrottled);
        }
        doProximityLoadingDebounced();
    }

    function addProximityLoader(el, distanceThreshold, loadFn) {
        // calls `loadFn` when `scrollTop` is within `distanceThreshold` of `el`
        var $el = bonzo(el),
            conditionFn = function () {
                var scrollTop = getScrollTop(),
                    elOffset = $el.offset(),
                    loadAfter = elOffset.top - distanceThreshold,
                    loadBefore = elOffset.top + elOffset.height + distanceThreshold;
                return scrollTop > loadAfter && scrollTop < loadBefore;
            };
        addItem(conditionFn, loadFn);
    }

    return {
        add: addProximityLoader
    };
});
