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
