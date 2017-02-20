define([
    'ophan/ng',
    'common/utils/user-timing'
], function (ophan, userTiming) {
    return function captureTiming() {
        var timing = window.performance && window.performance.timing;
        var performance;

        if (timing) {
            performance = {
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                connection: timing.connectEnd - timing.connectStart,
                firstByte: timing.responseStart - timing.connectEnd,
                lastByte: timing.responseEnd - timing.responseStart,
                domContentLoadedEvent: timing.domContentLoadedEventStart - timing.responseEnd,
                loadEvent: timing.loadEventStart - timing.domContentLoadedEventStart,
                navType: window.performance.navigation.type,
                redirectCount: window.performance.navigation.redirectCount,
                assetsPerformance: [
                    {
                        name: 'standard boot',
                        timing: parseInt(userTiming.getTiming('standard boot')),
                    },
                    {
                        name: 'commercial request',
                        timing: parseInt(userTiming.getTiming('commercial request')),
                    },
                    {
                        name: 'commercial boot',
                        timing: parseInt(userTiming.getTiming('commercial boot')),
                    },
                    {
                        name: 'enhanced request',
                        timing: parseInt(userTiming.getTiming('enhanced request')),
                    },
                    {
                        name: 'enhanced boot',
                        timing: parseInt(userTiming.getTiming('enhanced boot')),
                    }
                ],
            };
            ophan.record({ performance: performance });
        }
    }
});
