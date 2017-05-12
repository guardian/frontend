// @flow

/* eslint no-param-reassign: "off" */

import raven from 'lib/raven';
import config from 'lib/config';
import { getCurrentTime } from 'lib/user-timing';
import beacon from 'common/modules/analytics/beacon';
import ophan from 'ophan/ng';

type Module = {
    name: string,
    start: number,
    duration?: number,
};

type Baseline = {
    name: string,
    startTime: number,
    endTime?: number,
};

type AdvertMetrics = {
    id: string,
    isEmpty: boolean,
    createTime: number,
    startLoading: number,
    stopLoading: number,
    startRendering: number,
    stopRendering: number,
    loadingMethod: number,
    lazyWaitComplete: number,
};

const performanceLog = {
    viewId: 'unknown',
    tags: ([]: Array<string>),
    modules: ([]: Array<Module>),
    adverts: ([]: Array<AdvertMetrics>),
    baselines: ([]: Array<Baseline>),
};
const primaryBaseline = 'primary';

// moduleStart() and moduleEnd() can be used for measuring modules ad-hoc,
// when they don't align to a baseline.
const moduleStart = (moduleName: string): void => {
    const timerStart = getCurrentTime();
    performanceLog.modules.push({
        name: moduleName,
        start: timerStart,
    });
};

const moduleEnd = (moduleName: string): void => {
    const timerEnd = getCurrentTime();

    const moduleIndex = performanceLog.modules.findIndex(
        module => module.name === moduleName
    );

    if (moduleIndex !== -1) {
        const module: Module = performanceLog.modules[moduleIndex];
        module.duration = timerEnd - module.start;
    }
};

// updateAdvertMetric() is called whenever the advert timings need to be updated.
// It may be called multiple times for the same advert, so that we effectively update
// the object with additional timings.
const updateAdvertMetric = (
    advert: Object,
    metricName: string,
    metricValue: string | number
): void => {
    performanceLog.adverts = performanceLog.adverts.filter(
        element => advert.id !== element.id
    );
    advert.timings[metricName] = metricValue;
    performanceLog.adverts.push(
        Object.freeze(
            Object.assign(
                {
                    id: advert.id,
                    isEmpty: advert.isEmpty,
                },
                advert.timings
            )
        )
    );
};

const addStartTimeBaseline = (baselineName: string): void => {
    performanceLog.baselines.push({
        name: baselineName,
        startTime: getCurrentTime(),
    });
};

const addEndTimeBaseline = (baselineName: string): void => {
    performanceLog.baselines.forEach((baseline: Baseline) => {
        if (baseline.name === baselineName) {
            baseline.endTime = getCurrentTime();
        }
    });
};

// This posts the performance log to the beacon endpoint. It is expected that this be called
// multiple times in a page view, so that partial data is captured, and then topped up as adverts load in.
const reportTrackingData = (): void => {
    if (config.tests.commercialClientLogging) {
        const performanceReport = {
            viewId: ophan.viewId,
            tags: performanceLog.tags,
            adverts: performanceLog.adverts,
            baselines: performanceLog.baselines,
            modules: (performanceLog.modules || [])
                .filter((module: Object) => !!module.duration),
        };
        beacon.postJson(
            '/commercial-report',
            JSON.stringify(performanceReport)
        );
    }
};

const reportData = raven.wrap(reportTrackingData);

const setListeners = (googletag: Object): void => {
    googletag.pubads().addEventListener('slotRenderEnded', reportData);
};

const addTag = (tag: string): void => {
    performanceLog.tags.push(tag);
};

const wrap = (name: string, fn: Function): Function => {
    const [start, stop] = [
        moduleStart.bind(null, name),
        moduleEnd.bind(null, name),
    ];
    return (...args) => {
        start();
        try {
            const ret = fn(...args);
            if (ret instanceof Promise) {
                return ret.then(
                    value => {
                        stop();
                        return value;
                    },
                    reason => {
                        stop();
                        throw reason;
                    }
                );
            }
            stop();
            return ret;
        } catch (e) {
            stop();
            throw e;
        }
    };
};

const defer = (name: string, fn: Function): Function => {
    const [start, stop] = [
        moduleStart.bind(null, name),
        moduleEnd.bind(null, name),
    ];
    return (...args) => {
        try {
            const ret = fn(start, stop, ...args);
            // Module-initialiser functions using defer are expected to call stop(),
            // but a failed promise could be uncaught, so catch them here and call stop().
            if (ret instanceof Promise) {
                return ret.catch(reason => {
                    stop();
                    throw reason;
                });
            }
            return ret;
        } catch (e) {
            stop();
            throw e;
        }
    };
};

export {
    setListeners,
    updateAdvertMetric,
    addStartTimeBaseline,
    addEndTimeBaseline,
    primaryBaseline,
    addTag,
    wrap,
    defer,
};
