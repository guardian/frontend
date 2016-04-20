define([
    'bonzo',
    'common/utils/mediator',
    'fastdom',
    'lodash/collections/filter',
    'lodash/functions/debounce'
], function (
    bonzo,
    mediator,
    fastdom,
    filter,
    debounce
) {

    var items = [],
        scroll = {top: 0, bottom: 0},
        doProximityLoadingDebounced,
        doProximityLoading = function () {
            scroll.top = window.pageYOffset;
            scroll.bottom = scroll.top + bonzo.viewport().height;
            items = filter(items, function (item) {
                if (item.conditionFn()) {
                    item.loadFn();
                } else {
                    return true;
                }
            });
            if (items.length === 0) {
                mediator.off('window:throttledScroll', doProximityLoading);
            }
        };

    doProximityLoadingDebounced = debounce(doProximityLoading, 2000); // used on load for edge-case where user doesn't scroll

    function addItem(conditionFn, loadFn) {
        // calls `loadFn` when `conditionFn` is true
        var item = {conditionFn: conditionFn, loadFn: loadFn};
        items.push(item);
        if (items.length === 1) {
            mediator.on('window:throttledScroll', doProximityLoading);
        }
        doProximityLoadingDebounced();
    }

    function addProximityLoader(el, distanceThreshold, loadFn) {
        // calls `loadFn` when screen is within `distanceThreshold` of `el`
        fastdom.read(function () {
            var $el = bonzo(el),
                conditionFn = function () {
                    var elOffset = $el.offset(),
                        loadAfter = elOffset.top - distanceThreshold,
                        loadBefore = elOffset.top + elOffset.height + distanceThreshold;
                    return scroll.top > loadAfter && scroll.bottom < loadBefore;
                };
            addItem(conditionFn, loadFn);
        });
    }

    return {
        add: addProximityLoader
    };
});
