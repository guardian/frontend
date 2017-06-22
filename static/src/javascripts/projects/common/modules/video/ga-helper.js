// @flow
import type { MediaEventT } from 'common/modules/video/events';

const buildGoogleAnalyticsEvent = (
    mediaEvent: MediaEventT,
    metrics: Object,
    canonicalUrl: string,
    player: string,
    eventAction: MediaEventT => string,
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

const getGoogleAnalyticsEventAction = (mediaEvent: MediaEventT) => {
    let action = `${mediaEvent.mediaType} `;
    if (mediaEvent.isPreroll) {
        action += 'preroll';
    } else {
        action += 'content';
    }
    return action;
};

export { buildGoogleAnalyticsEvent, getGoogleAnalyticsEventAction };
