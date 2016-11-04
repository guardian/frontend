define([
], function (
) {

    function buildGoogleAnalyticsEvent(mediaEvent, metrics, canonicalUrl, playerName, eventAction, videoId) {

        var category = 'Media';
        var playerName = playerName;
        var action = eventAction(mediaEvent);
        var fieldsObject = {
            eventCategory: category,
            eventAction: action,
            eventLabel: canonicalUrl,
            dimension19: videoId,
            dimension20: playerName
        };
        // Increment the appropriate metric based on the event type
        var metricId = metrics[mediaEvent.eventType];
        if (metricId) {
            fieldsObject[metricId] = 1;
        }
        return fieldsObject;
    }
    return {
        buildGoogleAnalyticsEvent: buildGoogleAnalyticsEvent
    };
});
