define([
    'lib/raven',
    'lib/config',
    'lib/user-timing',
    'common/modules/analytics/beacon',
    'ophan/ng'
], function (
    raven,
    config,
    userTiming,
    beacon,
    ophan
) {

    var performanceLog = {
            viewId: 'unknown',
            tags: [],
            modules: [],
            adverts: [],
            baselines: []
        };
    var primaryBaseline = 'primary';
    var reportData = raven.wrap(reportTrackingData);

    function setListeners(googletag) {
        googletag.pubads().addEventListener('slotRenderEnded', reportData);
    }

    // moduleStart() and moduleEnd() can be used for measuring modules ad-hoc,
    // when they don't align to a baseline.
    function moduleStart(moduleName) {
        var timerStart = userTiming.getCurrentTime();
        performanceLog.modules.push({
            name: moduleName,
            start: timerStart
        });
    }

    function moduleEnd(moduleName) {
        var timerEnd = userTiming.getCurrentTime();

        var moduleIndex = performanceLog.modules.map(function (module) {
            return module.name;
        }).indexOf(moduleName);

        if (moduleIndex != -1) {
            var module = performanceLog.modules[moduleIndex];
            module.duration = timerEnd - module.start;
        }
    }

    // updateAdvertMetric() is called whenever the advert timings need to be updated.
    // It may be called multiple times for the same advert, so that we effectively update
    // the object with additional timings.
    function updateAdvertMetric(advert, metricName, metricValue) {
        performanceLog.adverts = performanceLog.adverts.filter(function(element){
            return advert.id !== element.id;
        });
        advert.timings[metricName] = metricValue;
        performanceLog.adverts.push(Object.freeze({
            id: advert.id,
            isEmpty: advert.isEmpty,
            createTime: advert.timings.createTime,
            startLoading: advert.timings.startLoading,
            stopLoading: advert.timings.stopLoading,
            startRendering: advert.timings.startRendering,
            stopRendering: advert.timings.stopRendering,
            loadingMethod: advert.timings.loadingMethod,
            lazyWaitComplete: advert.timings.lazyWaitComplete
        }));
    }

    function addStartTimeBaseline(baselineName) {
        performanceLog.baselines.push({
            name: baselineName,
            startTime: userTiming.getCurrentTime()
        });
    }

    function addEndTimeBaseline(baselineName) {
        performanceLog.baselines.forEach(function(baseline) {
            if (baseline.name === baselineName) {
                baseline.endTime = userTiming.getCurrentTime();
            }
        });
    }

    // This posts the performance log to the beacon endpoint. It is expected that this be called
    // multiple times in a page view, so that partial data is captured, and then topped up as adverts load in.
    function reportTrackingData() {
        if (config.tests.commercialClientLogging) {
            var performanceReport = {
                viewId: ophan.viewId,
                tags: performanceLog.tags,
                adverts: performanceLog.adverts,
                baselines: performanceLog.baselines,
                modules : (performanceLog.modules || []).filter(function (module){
                    return !!module.duration;
                })
            };
            beacon.postJson('/commercial-report', JSON.stringify(performanceReport));
        }
    }

    function addTag(tag) {
        performanceLog.tags.push(tag);
    }

    function wrap(name, fn) {
        var start = moduleStart.bind(null, name);
        var stop = moduleEnd.bind(null, name);
        return function() {
            start();
            try {
                var ret = fn.apply(null, arguments);
                if (ret instanceof Promise) {
                    return ret.then(function (value) {
                        stop();
                        return value;
                    }, function(reason) {
                        stop();
                        throw reason;
                    });
                } else {
                    stop();
                    return ret;
                }
            } catch (e) {
                stop();
                throw e;
            }
        };
    }

    function defer(name, fn) {
        var start = moduleStart.bind(null, name);
        var stop = moduleEnd.bind(null, name);
        var startStop = [start, stop];
        return function() {
            try {
                var ret = fn.apply(null, startStop.concat(startStop.slice.call(arguments)));
                // Module-initialiser functions using defer are expected to call stop(),
                // but a failed promise could be uncaught, so catch them here and call stop().
                if (ret instanceof Promise) {
                    return ret.catch(function(reason) {
                        stop();
                        throw reason;
                    });
                }
                return ret;
            } catch (e) {
                stop();
                throw e;
            }
        }
    }

    return {
        setListeners : setListeners,
        updateAdvertMetric : updateAdvertMetric,
        addStartTimeBaseline : addStartTimeBaseline,
        addEndTimeBaseline : addEndTimeBaseline,
        primaryBaseline : primaryBaseline,
        addTag: addTag,
        wrap: wrap,
        defer: defer
    };
});
