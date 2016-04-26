define([
    'Promise',
    'common/utils/mediator'
], function(Promise, mediator) {
    return trackAd;

    function trackAd(id) {
        return new Promise(function (resolve, reject) {
            var onAdLoaded = function (event) {
                if (event.slot.getSlotElementId() === id) {
                    unlisten();
                    resolve(!event.isEmpty);
                }
            };

            var onAllAdsLoaded = function () {
                unlisten();
                reject(new Error('Slot ' + id + ' failed to load'));
            };

            function unlisten() {
                mediator.off('modules:commercial:dfp:rendered', onAdLoaded);
                mediator.off('modules:commercial:dfp:alladsrendered', onAllAdsLoaded);
            }

            mediator.on('modules:commercial:dfp:rendered', onAdLoaded);
            mediator.on('modules:commercial:dfp:alladsrendered', onAllAdsLoaded);
        });
    }
})
