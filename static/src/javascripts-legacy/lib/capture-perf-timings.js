define([
    'ophan/ng',
    'lib/user-timing',
    'lib/window-performance',
], function (ophan, userTiming, performanceAPI) {
    return function captureTiming() {
        var supportsPerformanceProperties = 'navigation' in performanceAPI &&
                                            'timing' in performanceAPI;

        if (!supportsPerformanceProperties) {
            return;
        }

        var timing = performanceAPI && performanceAPI.timing;

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
            navType: performanceAPI.navigation.type,
            redirectCount: performanceAPI.navigation.redirectCount,
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
