define([
    'raven'
], function (raven) {

    var loggingObject = {
            page: {},
            adverts: {},
            baselines: {
                initial : new Date().getTime()
            }
        },
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
                };

            googletag.debug_log.log = function interceptedGptDebugger(level, message, service, slot) {
                var lifecycleId = message.getMessageId(), slotId, timingAttr;

                if (lifecycleId && slot) {
                    slotId = slot.getSlotElementId();
                    adTimings[slotId] = adTimings[slotId] || {};
                    timingAttr = lifecycleIdToTimingAttr[lifecycleId];
                    adTimings[slotId][timingAttr] = new Date().getTime();

                    if (slotId === 'dfp-ad--inline1' && timingAttr) {

                        //console.log('olde report: ' + timingAttr + '  ' + (adTimings[slotId][timingAttr] - commercialInitTime) );
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
                            timeToRenderEnded: safeDiff(loggingObject.baselines.initial, new Date().getTime()),

                            // overall time to make an ad request
                            timeToAdRequest: safeDiff(loggingObject.baselines.initial, slotTiming.fetch),

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

    function pageCheckpoint(message, baseline){
        var timerEnd = new Date().getTime();
        var timerStart = getBaseline(baseline);
        console.log('new report: ', message, ' : duration : ', timerEnd - timerStart, ' began execution at ', timerStart);
    }

    function advertCheckpoint (adName, stage, time , lazyLoadSusceptible) {
        if(!loggingObject.adverts[adName]) {
            loggingObject.adverts[adName] = {};
        }

        if(lazyLoadSusceptible == false) {
            var timeDiff  = time - getBaseline(primaryBaseline);

            loggingObject.adverts[adName][stage] = timeDiff;
        } else {
            if(!loggingObject.adverts[adName]["lazyDelay"]){
                var lazyDelay = loggingObject.baselines["lazyLoadBaseline"] - getBaseline(primaryBaseline);
                loggingObject.adverts[adName]["lazyDelay"] = lazyDelay;
            }
            var timeDiff = time - loggingObject.baselines["lazyLoadBaseline"];
            loggingObject.adverts[adName][stage] = timeDiff;
            console.log(loggingObject);
        }
    }

    function addBaseline(baselineName){
        loggingObject.baselines[baselineName] = new Date().getTime();
    }

    function getBaseline(baselineName){
        return loggingObject.baselines[baselineName];
    }

    function debugTimings(){
        // This is where the first ophan send should be.
        console.log(loggingObject)
    }

    return {
        trackPerformance : trackPerformance,
        pageCheckpoint : pageCheckpoint,
        advertCheckpoint: advertCheckpoint,
        addBaseline : addBaseline,
        primaryBaseline : primaryBaseline,
        secondaryBaseline: secondaryBaseline,

        debugTimings : debugTimings
    };
});
