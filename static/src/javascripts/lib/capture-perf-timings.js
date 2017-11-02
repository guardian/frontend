// @flow
import ophan from 'ophan/ng';
import { getMarkTime } from 'lib/user-timing';
import performanceAPI from 'lib/window-performance';

const capturePerfTimings = (): void => {
    const supportsPerformanceProperties =
        performanceAPI &&
        'navigation' in performanceAPI &&
        'timing' in performanceAPI;

    if (!supportsPerformanceProperties) {
        return;
    }

    const timing = performanceAPI.timing;

    const marks = [
        'standard boot',
        'commercial request',
        'commercial boot',
        'enhanced request',
        'enhanced boot',
    ];
    const performance = {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        connection: timing.connectEnd - timing.connectStart,
        firstByte: timing.responseStart - timing.connectEnd,
        lastByte: timing.responseEnd - timing.responseStart,
        domContentLoadedEvent:
            timing.domContentLoadedEventStart - timing.responseEnd,
        loadEvent: timing.loadEventStart - timing.domContentLoadedEventStart,
        navType: performanceAPI.navigation.type,
        redirectCount: performanceAPI.navigation.redirectCount,
        assetsPerformance: marks.map(mark => ({
            name: mark,
            timing: parseInt(getMarkTime(mark) || 0, 10),
        })),
    };

    ophan.record({
        performance,
    });
};

export { capturePerfTimings };
