define([
    'ophan/ng',
    'common/utils/user-timing'
], function (ophan, userTiming) {
    return function captureTiming() {
        var timing = window.performance && window.performance.timing;
        var performance;

        if (timing) {
            performance = {
                standardBoot: parseInt(userTiming.getTiming('standardBoot')),
                commercialRequest: parseInt(userTiming.getTiming('commercialRequest')),
                commercialBoot: parseInt(userTiming.getTiming('commercialBoot')),
                enhancedRequest: parseInt(userTiming.getTiming('enhancedRequest')),
                enhancedBoot: parseInt(userTiming.getTiming('enhancedBoot')),
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                connection: timing.connectEnd - timing.connectStart,
                firstByte: timing.responseStart - timing.connectEnd,
                lastByte: timing.responseEnd - timing.responseStart,
                domContentLoadedEvent: timing.domContentLoadedEventStart - timing.responseEnd,
                loadEvent: timing.loadEventStart - timing.domContentLoadedEventStart,
                navType: window.performance.navigation.type,
                redirectCount: window.performance.navigation.redirectCount
            };
            ophan.record({ performance: performance });
        }
    }
});
