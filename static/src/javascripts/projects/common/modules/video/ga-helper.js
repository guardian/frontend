const buildGoogleAnalyticsEvent = (
    mediaEvent,
    metrics,
    canonicalUrl,
    player,
    eventAction,
    videoId
) => {
    const category = 'media';
    const playerName = player;
    const action = eventAction(mediaEvent);
    const fieldsObject = {
        eventCategory: category,
        eventAction: action,
        eventLabel: canonicalUrl,
        dimension19: videoId,
        dimension20: playerName,
    };
    // Increment the appropriate metric based on the event type
    const metricId = metrics[mediaEvent.eventType];
    if (metricId) {
        fieldsObject[metricId] = 1;
    }
    return fieldsObject;
};

const getGoogleAnalyticsEventAction = (mediaEvent) => {
    let action = `${mediaEvent.mediaType} `;
    if (mediaEvent.isPreroll) {
        action += 'preroll';
    } else {
        action += 'content';
    }
    return action;
};



const buildPfpEvent = (
    pfpEventType,
    videoId
) => {
    const pfpEventMetric = pfpEventType === 'adStart' ? 24 : 25;
    return {
        eventCategory: 'media',
        eventAction: 'video preroll',
        eventLabel: videoId,
        dimension19: videoId,
        dimension20: 'gu-video-youtube',
        [`metric${pfpEventMetric}`]: 1,
    };
};

export {
    buildGoogleAnalyticsEvent,
    getGoogleAnalyticsEventAction,
    buildPfpEvent,
};
