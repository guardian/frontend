define([
    'ophan/ng',
    'common/utils/user-timing'
], function (ophan, userTiming) {
    return function captureTiming() {
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
            navType: window.performance.navigation.type,
            redirectCount: window.performance.navigation.redirectCount,
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
