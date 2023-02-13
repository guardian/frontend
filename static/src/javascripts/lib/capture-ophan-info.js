import ophan from 'ophan/ng';
import { getMarkTime } from 'lib/user-timing';
import performanceAPI from 'lib/window-performance';
import config from './config';

const captureOphanInfo = () => {
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

    let ophanInfo = {};

    if (config.get('page.dcrCouldRender', false)) {
        ophanInfo = { ...ophanInfo, ...{ experiences: 'dcrCouldRender' } };
    }

    const edition = config.get('page.edition', false);
    if (edition) {
        ophanInfo = { ...ophanInfo, ...{ edition } };
    }

    ophan.record({
        ...ophanInfo,
        ...{
            performance,
        },
    });
};

export { captureOphanInfo };
