// @flow

type MediaEvent = {
    mediaId: string,
    mediaType: string,
    eventType: string,
    isPreroll: boolean,
};

const buildGoogleAnalyticsEvent = (
    mediaEvent: MediaEvent,
    metrics: Object,
    canonicalUrl: string,
    player: string,
    eventAction: MediaEvent => string,
    videoId: string
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

const getGoogleAnalyticsEventAction = (mediaEvent: MediaEvent) => {
    let action = `${mediaEvent.mediaType} `;
    if (mediaEvent.isPreroll) {
        action += 'preroll';
    } else {
        action += 'content';
    }
    return action;
};

export type { MediaEvent };
export { buildGoogleAnalyticsEvent, getGoogleAnalyticsEventAction };
