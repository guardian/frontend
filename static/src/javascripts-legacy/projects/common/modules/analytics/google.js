define([
    'lib/config',
    'lib/mediator',
    'lib/window-performance',
], function (
    config,
    mediator,
    performanceAPI
) {
    var trackerName = config.googleAnalytics.trackers.editorial;
    var send = trackerName + '.send';
    var boostGaUserTimingFidelityMetrics = {
        standardStart: 'metric18',
        standardEnd: 'metric19',
        commercialStart: 'metric20',
        commercialEnd: 'metric21',
        enhancedStart: 'metric22',
        enhancedEnd: 'metric23'
    };

    function extractLinkText(el) {
        var text;
        if (el && typeof el.textContent === 'string') {
            text = el.textContent.trim();
        }
        return text;
    }

    function trackNonClickInteraction(actionName) {
        window.ga(send, 'event', 'Interaction', actionName, {
            nonInteraction: true // to avoid affecting bounce rate
        });
    }

    function trackSamePageLinkClick(target, tag) {
        window.ga(send, 'event', 'click', 'in page', tag, {
            nonInteraction: true, // to avoid affecting bounce rate
            dimension13: extractLinkText(target)
        });
    }

    function trackExternalLinkClick(target, tag) {
        window.ga(send, 'event', 'click', 'external', tag, {
            dimension13: extractLinkText(target)
        });
    }

    function trackSponsorLogoLinkClick(target) {
        var sponsorName = target.dataset.sponsor;
        window.ga(send, 'event', 'click', 'sponsor logo', sponsorName, {
            nonInteraction: true
        });
    }

    function trackNativeAdLinkClick(slotName, tag) {
        window.ga(send, 'event', 'click', 'native ad', tag, {
            nonInteraction: true,
            dimension25: slotName
        });
    }

    function mapEvents() {
        config.googleAnalytics.timingEvents.map(sendPerformanceEvent);
        mediator.off('modules:ga:ready', mapEvents);
    }

    function sendPerformanceEvent(event) {
        window.ga(send, 'timing', event.timingCategory, event.timingVar, event.timeSincePageLoad, event.timingLabel);

        // send performance events as normal events too,
        // so we can avoid the 0.1% sampling that affects timing events
        if (config.switches.boostGaUserTimingFidelity) {
            // these are our own metrics that map to our timing events
            var metric = boostGaUserTimingFidelityMetrics[event.timingVar];

            var fieldsObject = {
                nonInteraction: true, // to avoid affecting bounce rate
                dimension44: metric // dimension44 is dotcomPerformance
            };

            fieldsObject[metric] = event.timeSincePageLoad;

            window.ga(send, 'event', event.timingCategory, event.timingVar, event.timingLabel, event.timeSincePageLoad, fieldsObject);
        }
    }

    // Track important user timing metrics so that we can be notified and measure over time in GA
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings
    // Tracks into Behaviour > Site Speed > User Timings in GA
    function trackPerformance(timingCategory, timingVar, timingLabel) {
        // Feature detect Navigation Timing API support.
        if ('now' in performanceAPI) {
            // Value must be an integer - grabs the number of milliseconds since page load
            var timeSincePageLoad = Math.round(performanceAPI.now());
            var eventObj = {
                timingCategory: timingCategory,
                timingVar: timingVar,
                timeSincePageLoad: timeSincePageLoad,
                timingLabel: timingLabel
            };

            if (window.ga) {
                sendPerformanceEvent(eventObj);
            } else {
                mediator.on('modules:ga:ready', mapEvents);
                config.googleAnalytics.timingEvents.push(eventObj)
            }
        }
    }

    return {
        trackNonClickInteraction: trackNonClickInteraction,
        trackSamePageLinkClick: trackSamePageLinkClick,
        trackExternalLinkClick: trackExternalLinkClick,
        trackSponsorLogoLinkClick: trackSponsorLogoLinkClick,
        trackNativeAdLinkClick: trackNativeAdLinkClick,
        trackPerformance: trackPerformance
    };
});
