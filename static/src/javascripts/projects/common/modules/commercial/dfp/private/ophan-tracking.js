define([
    'raven',
    'common/utils/user-timing',
    'common/modules/commercial/dfp/private/get-advert-by-id'
], function (raven, userTiming, getAdvertById) {

    var performanceLog = {
            modules: [],
            adverts: [],
            baselines: []
        },
        initial = new Date().getTime(), // For backwards compatibility below, whilst we still use the old ophan format.
        primaryBaseline = 'primary',
        secondaryBaseline = 'secondary';

    function trackPerformance(googletag) {

        var adTimings = {};
        spyOnAdDebugTimings();
        reportAdsAndTimingsOnRender();

        function spyOnAdDebugTimings() {
            // Spy on undocumented GPT debugging API and store granular ad timing data in 'adTimings' map

            if (!googletag.debug_log || !googletag.debug_log.log) {
                return;
            }

            var originalDebugger = googletag.debug_log.log,
                lifecycleIdToTimingAttr = {
                    3: 'fetch',
                    4: 'receive',
                    6: 'render'
                },
                lifecycleIdToAdvertTiming = {
                    3: 'dfpFetching',
                    4: 'dfpReceived',
                    6: 'dfpRendered'
                };

            googletag.debug_log.log = function interceptedGptDebugger(level, message, service, slot) {
                var lifecycleId = message.getMessageId(), slotId, timingAttr;

                if (lifecycleId && slot) {
                    slotId = slot.getSlotElementId();
                    adTimings[slotId] = adTimings[slotId] || {};
                    timingAttr = lifecycleIdToTimingAttr[lifecycleId];
                    adTimings[slotId][timingAttr] = new Date().getTime();

                    var advert = getAdvertById(slotId);
                    var timing = lifecycleIdToAdvertTiming[lifecycleId];
                    if (advert && timing in advert.timings) {
                        advert.timings[timing] = userTiming.getCurrentTime();
                    }
                }

                // Call original debugger as normal
                return originalDebugger.apply(this, arguments);
            };
        }

        function reportAdsAndTimingsOnRender() {
            // We do not know if and when the debugger will be called, so we cannot wait for its timing
            // data before sending Ophan calls

            googletag.pubads().addEventListener('slotRenderEnded', raven.wrap(function reportAdToOphan(event) {
                require(['ophan/ng'], function (ophan) {

                    var slotId = event.slot.getSlotElementId(),
                        slotTiming = adTimings[slotId] || {};

                    function lineItemIdOrEmpty(event) {
                        if (event.isEmpty) {
                            return '__empty__';
                        } else {
                            return event.lineItemId;
                        }
                    }

                    ophan.record({
                        ads: [{
                            slot: event.slot.getSlotElementId(),
                            campaignId: lineItemIdOrEmpty(event),
                            creativeId: event.creativeId,
                            timeToRenderEnded: safeDiff(initial, new Date().getTime()),

                            // overall time to make an ad request
                            timeToAdRequest: safeDiff(initial, slotTiming.fetch),

                            // delay between requesting and receiving an ad
                            adRetrievalTime: safeDiff(slotTiming.fetch, slotTiming.receive),

                            // delay between receiving and rendering an ad
                            adRenderTime: safeDiff(slotTiming.receive, slotTiming.render),

                            adServer: 'DFP'
                        }]
                    });
                });
            }));

            function safeDiff(first, last) {
                if (first && last) {
                    return last - first;
                }
            }
        }
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

    function addBaseline(baselineName) {
        performanceLog.baselines.push({
            name: baselineName,
            time: userTiming.getCurrentTime()
        });
    }

    function getBaseline(baselineName) {
        var index = performanceLog.baselines
            .map(function (_) { return _.name; })
            .indexOf(baselineName);
        return index > -1 ? performanceLog.baselines[index].time : 0;
    }

    return {
        trackPerformance : trackPerformance,
        moduleCheckpoint : moduleCheckpoint,
        updateAdvertMetric : updateAdvertMetric,
        addBaseline : addBaseline,
        primaryBaseline : primaryBaseline,
        secondaryBaseline: secondaryBaseline
    };
});
