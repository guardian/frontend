define([
    'common/utils/raven',
    'common/utils/config',
    'common/utils/user-timing',
    'common/modules/analytics/beacon'
], function (
    raven,
    config,
    userTiming,
    beacon
) {

    var performanceLog = {
            viewId: 'unknown',
            tags: [],
            modules: [],
            adverts: [],
            baselines: []
        };
    var primaryBaseline = 'primary';
    var secondaryBaseline = 'secondary';

    function setListeners(googletag) {
        googletag.pubads().addEventListener('slotRenderEnded', raven.wrap(reportTrackingData));
    }

    // moduleCheckpoint() is called when a module has finished execution.
    // The baseline allows us to determine whether the module was called in the first
    // boot phase (primary) or the second boot phase (secondary).
    function moduleCheckpoint(module, baseline) {
        var timerEnd = userTiming.getCurrentTime();
        var timerStart = getBaseline(baseline);
        performanceLog.modules.push({
            name: module,
            start: timerStart,
            duration: timerEnd - timerStart
        });
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
            dfpFetching: advert.timings.dfpFetching,
            dfpReceived: advert.timings.dfpReceived,
            dfpRendered: advert.timings.dfpRendered,
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

    function getBaseline(baselineName) {
        var index = performanceLog.baselines
            .map(function (_) { return _.name; })
            .indexOf(baselineName);
        return index > -1 ? performanceLog.baselines[index].startTime : 0;
    }

    // This posts the performance log to the beacon endpoint. It is expected that this be called
    // multiple times in a page view, so that partial data is captured, and then topped up as adverts load in.
    function reportTrackingData() {
        if (config.tests.commercialClientLogging) {
            require(['ophan/ng'], function (ophan) {
                performanceLog.viewId = ophan.viewId;

                beacon.postJson('/commercial-report', JSON.stringify(performanceLog));
            });
        }
    }

    function addTag(tag) {
        performanceLog.tags.push(tag);
    }

    return {
        setListeners : setListeners,
        moduleCheckpoint : moduleCheckpoint,
        moduleStart: moduleStart,
        moduleEnd: moduleEnd,
        updateAdvertMetric : updateAdvertMetric,
        addStartTimeBaseline : addStartTimeBaseline,
        addEndTimeBaseline : addEndTimeBaseline,
        primaryBaseline : primaryBaseline,
        secondaryBaseline: secondaryBaseline,
        addTag: addTag,
        reportTrackingData: raven.wrap(reportTrackingData)
    };
});
