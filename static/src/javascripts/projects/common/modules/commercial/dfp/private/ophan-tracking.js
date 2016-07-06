define([
    'raven'
], function (raven) {

    var baselines = {
            initial : new Date().getTime()
        },
        loggingObject = {
            page: {},
            adverts: {},
            baselines: {}
        };

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
                            timeToRenderEnded: safeDiff(baselines.initial, new Date().getTime()),

                            // overall time to make an ad request
                            timeToAdRequest: safeDiff(baselines.initial, slotTiming.fetch),

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

    function checkpoint(message, baseline){
        var timerEnd = new Date().getTime();
        var timerStart = baselines[baseline];
        console.log('new report: ', message, ' : duration : ', timerEnd - timerStart, ' began execution at ', timerStart);
    }

    function advertCheckpoint (adName, message, time , lazyLoadSusceptible) {
        if(lazyLoadSusceptible == false) {
            var timeDiff  = time - baselines["secondary"];
            console.log(adName +" "+ message +" "+ timeDiff);
        } else {
            var lazyDelay = baselines["lazyLoadBaseline"] - baselines["start"];
            var timeDiff = time - baselines["lazyLoadBaseline"];
            console.log(adName + " "+ message + " " + timeDiff + " (lazyLoadDelay = " + lazyDelay + ")");
        }
    }

    function addBaseline(baselineName){
        baselines[baselineName] = new Date().getTime();
    }

    return {
        trackPerformance : trackPerformance,
        checkpoint : checkpoint,
        advertCheckpoint: advertCheckpoint,
        addBaseline : addBaseline
    };
});
