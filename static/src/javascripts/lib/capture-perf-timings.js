import ophan from 'ophan/ng';
import userTiming from 'lib/user-timing';
import performanceAPI from 'lib/window-performance';
export default function captureTiming() {
    const supportsPerformanceProperties = 'navigation' in performanceAPI &&
        'timing' in performanceAPI;

    if (!supportsPerformanceProperties) {
        return;
    }

    const timing = performanceAPI && performanceAPI.timing;

    const marks = [
        'standard boot',
        'commercial request',
        'commercial boot',
        'enhanced request',
        'enhanced boot'
    ];
    const performance = {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        connection: timing.connectEnd - timing.connectStart,
        firstByte: timing.responseStart - timing.connectEnd,
        lastByte: timing.responseEnd - timing.responseStart,
        domContentLoadedEvent: timing.domContentLoadedEventStart - timing.responseEnd,
        loadEvent: timing.loadEventStart - timing.domContentLoadedEventStart,
        navType: performanceAPI.navigation.type,
        redirectCount: performanceAPI.navigation.redirectCount,
        assetsPerformance: marks.map(mark => ({
            name: mark,
            timing: parseInt(userTiming.getMarkTime(mark) || 0, 10)
        })),
    };

    ophan.record({
        performance
    });
}
