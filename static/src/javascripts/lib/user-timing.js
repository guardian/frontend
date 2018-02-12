// @flow

import performanceAPI from 'lib/window-performance';

const timings = {};
const startDate = new Date().getTime();

const getCurrentTime = (): number => {
    if (performanceAPI && 'now' in performanceAPI) {
        return performanceAPI.now();
    }

    return new Date().getTime() - startDate;
};

const markTime = (label: string): void => {
    if (performanceAPI && 'mark' in performanceAPI) {
        performanceAPI.mark(label);
    } else {
        timings[label] = getCurrentTime();
    }
};

// Returns the ms time when the mark was made.
const getMarkTime = (label: string): ?number => {
    if (performanceAPI && 'getEntriesByName' in performanceAPI) {
        const perfMark = performanceAPI.getEntriesByName(label, 'mark');

        if (perfMark && perfMark[0] && 'startTime' in perfMark[0]) {
            return perfMark[0].startTime;
        }
    } else if (label in timings) {
        return timings[label];
    }
};

export { markTime, getMarkTime, getCurrentTime };
