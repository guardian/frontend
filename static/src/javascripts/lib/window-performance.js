// @flow

import { noop } from 'lib/noop';

const api = window.performance ||
window.msPerformance ||
window.webkitPerformance ||
window.mozPerformance || {
    getEntriesByName: noop,

    navigation: {
        redirectCount: 0,
        type: '',
    },

    mark: noop,
    now: noop,

    timing: {
        connectStart: 0,
        connectEnd: 0,

        domainLookupEnd: 0,
        domainLookupStart: 0,

        domContentLoadedEventStart: 0,

        loadEventStart: 0,
        loadEventEnd: 0,

        responseStart: 0,
        responseEnd: 0,
    },
};

export default api;
