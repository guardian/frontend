define([
    'Promise',
    'common/utils/mediator',
    'lodash/functions/memoize'
], function(Promise, mediator, memoize) {

    // Despite its misleading name, the dfp:rendered event is triggered when
    // and ad is loaded into the DOM. As we have our breakout algorithm taking
    // over, it does not necessarily correlate with the creative being rendered
    var trackAdLoad = memoize(function trackAd(id) {
        return new Promise(function (resolve, reject) {
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
    });

    return trackAdLoad;
});
