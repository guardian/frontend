// @flow

import performanceAPI from 'lib/window-performance';

const timings = {};
const startDate = new Date().getTime();

const getCurrentTime = (): number => {
    if ('now' in performanceAPI) {
        return performanceAPI.now();
    }

    return new Date().getTime() - startDate;
};

const markTime = (label: string): void => {
    if ('mark' in performanceAPI) {
        performanceAPI.mark(label);
    } else {
        timings[label] = getCurrentTime();
    }
};

// Returns the ms time when the mark was made.
const getMarkTime = (label: string): ?number => {
    if ('getEntriesByName' in performanceAPI) {
        const perfMark = performanceAPI.getEntriesByName(label, 'mark')[0];

        if (perfMark && 'startTime' in perfMark) {
            return perfMark.startTime;
        }
    } else if (label in timings) {
        return timings[label];
    }
};

export { markTime, getMarkTime, getCurrentTime };
