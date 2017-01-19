define([
    'common/utils/config',
    'common/utils/mediator'
], function (
    config,
    mediator
) {
    var ga = window.ga;
    var trackerName = config.googleAnalytics.trackers.editorial;
    var send = trackerName + '.send';

    function extractLinkText(el) {
        var text;
        if (el && typeof el.textContent === 'string') {
            text = el.textContent.trim();
        }
        return text;
    }

    function trackNonClickInteraction(actionName) {
        ga(send, 'event', 'Interaction', actionName, {
            nonInteraction: true // to avoid affecting bounce rate
        });
    }

    function trackSamePageLinkClick(target, tag) {
        ga(send, 'event', 'click', 'in page', tag, {
            nonInteraction: true, // to avoid affecting bounce rate
            dimension13: extractLinkText(target)
        });
    }

    function trackExternalLinkClick(target, tag) {
        ga(send, 'event', 'click', 'external', tag, {
            dimension13: extractLinkText(target)
        });
    }

    function trackSponsorLogoLinkClick(target) {
        var sponsorName = target.dataset.sponsor;
        ga(send, 'event', 'click', 'sponsor logo', sponsorName, {
            nonInteraction: true
        });
    }

    function trackNativeAdLinkClick(slotName, tag) {
        ga(send, 'event', 'click', 'native ad', tag, {
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
    }

    // Track important user timing metrics so that we can be notified and measure over time in GA
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings
    // Tracks into Behaviour > Site Speed > User Timings in GA
    function trackPerformance(timingCategory, timingVar, timingLabel) {
        // Feature detect Navigation Timing API support.
        if (window.performance) {
            // Value must be an integer - grabs the number of milliseconds since page load
            var timeSincePageLoad = Math.round(window.performance.now());

            if (window.ga) {
                sendPerformanceEvent({
                    timingCategory: timingCategory,
                    timingVar: timingVar,
                    timeSincePageLoad: timeSincePageLoad,
                    timingLabel: timingLabel
                });
            } else {
                if (!config.googleAnalytics.timingEvents) {
                    config.googleAnalytics.timingEvents = [];
                }

                mediator.on('modules:ga:ready', mapEvents);

                config.googleAnalytics.timingEvents.push({
                    timingCategory: timingCategory,
                    timingVar: timingVar,
                    timeSincePageLoad: timeSincePageLoad,
                    timingLabel: timingLabel
                })
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
