define([
    'ophan/ng',
    'lib/user-timing'
], function (ophan, userTiming) {
    return function captureTiming() {
        var supportsPerformance = 'performance' in window;

        if (!supportsPerformance) {
            return;
        }

        var supportsNavigation = 'navigation' in window.performance;
        var timing = window.performance && window.performance.timing;

        if (!timing) {
            return;
        }

        var marks = [
            'standard boot',
            'commercial request',
            'commercial boot',
            'enhanced request',
            'enhanced boot'
        ];
        var performance = {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            connection: timing.connectEnd - timing.connectStart,
            firstByte: timing.responseStart - timing.connectEnd,
            lastByte: timing.responseEnd - timing.responseStart,
            domContentLoadedEvent: timing.domContentLoadedEventStart - timing.responseEnd,
            loadEvent: timing.loadEventStart - timing.domContentLoadedEventStart,
            navType:  supportsNavigation ? window.performance.navigation.type : undefined,
            redirectCount: supportsNavigation ? window.performance.navigation.redirectCount : undefined,
            assetsPerformance: marks.map(function (mark) {
                return {
                    name: mark,
                    timing: parseInt(userTiming.getTiming(mark) || 0, 10),
                };
            }),
        };

        ophan.record({ performance: performance });
    }
});
