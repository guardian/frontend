function buildGoogleAnalyticsEvent(mediaEvent, metrics, canonicalUrl, player, eventAction, videoId) {

    var category = 'media';
    var playerName = player;
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

function getGoogleAnalyticsEventAction(mediaEvent) {
    var action = mediaEvent.mediaType + ' ';
    if (mediaEvent.isPreroll) {
        action += 'preroll';
    } else {
        action += 'content';
    }
    return action;
}

export default {
    buildGoogleAnalyticsEvent: buildGoogleAnalyticsEvent,
    getGoogleAnalyticsEventAction: getGoogleAnalyticsEventAction
};
