define([
    'bonzo',
    'common/utils/_',
    'common/utils/mediator'
], function (
    bonzo,
    _,
    mediator
) {

    var items = [],
        scroll = {top: 0, bottom: 0},
        doProximityLoadingThrottled, doProximityLoadingDebounced,
        doProximityLoading = function () {
            scroll.top = bonzo(document.body).scrollTop();
            scroll.bottom = scroll.top + bonzo.viewport().height;
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
        // calls `loadFn` when screen is within `distanceThreshold` of `el`
        var $el = bonzo(el),
            conditionFn = function () {
                var elOffset = $el.offset(),
                    loadAfter = elOffset.top - distanceThreshold,
                    loadBefore = elOffset.top + elOffset.height + distanceThreshold;
                return scroll.top > loadAfter && scroll.bottom < loadBefore;
            };
        addItem(conditionFn, loadFn);
    }

    return {
        add: addProximityLoader
    };
});
