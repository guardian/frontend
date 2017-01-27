define([
    'ophan/ng',
    'common/utils/user-timing'
], function (ophan, userTiming) {
    return function captureTiming() {
        var timing = window.performance && window.performance.timing;
        var performance;

        if (timing) {
            performance = {
                standardBoot: parseInt(userTiming.getTiming('standard boot')),
                commercialRequest: parseInt(userTiming.getTiming('commercial request')),
                commercialBoot: parseInt(userTiming.getTiming('commercial boot')),
                enhancedRequest: parseInt(userTiming.getTiming('enhanced request')),
                enhancedBoot: parseInt(userTiming.getTiming('enhanced boot')),
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
