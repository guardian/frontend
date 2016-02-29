define([
    'Promise',
    'common/utils/mediator'
], function (
    Promise,
    mediator
) {
    var promises = {};

    function trackAd(id) {
        promises[id] = promises[id] || new Promise(function (resolve, reject) {
            var onAdLoaded = function (event) {
                if (event.slot.getSlotElementId() === id) {
                    unlisten();
                    resolve(!event.isEmpty);
                }
            };

            var onAllAdsLoaded = function () {
                unlisten();
                reject(new Error('Slot ' + id + ' was never loaded'));
            };

            function unlisten() {
                mediator.off('modules:commercial:dfp:rendered', onAdLoaded);
                mediator.off('modules:commercial:dfp:alladsrendered', onAllAdsLoaded);
            }

            mediator.on('modules:commercial:dfp:rendered', onAdLoaded);
            mediator.on('modules:commercial:dfp:alladsrendered', onAllAdsLoaded);
        });

        return promises[id];
    }

    return trackAd;
});
