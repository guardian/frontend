// @flow
import mediator from 'lib/mediator';
import config from 'lib/config';
import ophan from 'ophan/ng';
import { buildGoogleAnalyticsEvent } from 'common/modules/video/ga-helper';

const eventAction = () => 'video content';

const buildEventId = (event, videoId) => `${event}:${videoId}`;

/**
 *
 * @param mediaId {string}
 * @param mediaType {string} audio|video
 * @param eventType {string} e.g. firstplay, firstend
 * @param isPreroll {boolean}
 * @returns {{mediaId: string, mediaType: string, eventType: string, isPreroll: boolean}}
 */
const MediaEvent = (mediaId, mediaType, eventType) => ({
    mediaId,
    mediaType,
    eventType,
});

const initYoutubeEvents = videoId => {
    const gaTracker = config.googleAnalytics.trackers.editorial;
    const events = {
        metricMap: {
            play: 'metric1',
            skip: 'metric2',
            '25': 'metric3',
            '50': 'metric4',
            '75': 'metric5',
            end: 'metric6',
        },
        baseEventObject: {
            eventCategory: 'media',
            eventAction: eventAction(),
            eventLabel: videoId,
            dimension19: videoId,
            dimension20: 'gu-video-youtube',
        },
    };
    const eventsList = ['play', '25', '50', '75', 'end'];
    const ophanRecord = event => {
        const eventObject = {
            video: {
                id: `gu-video-youtube-${event.mediaId}`,
                eventType: `video:content:${event.eventType}`,
            },
        };
        ophan.record(eventObject);
    };

    eventsList.forEach(event => {
        mediator.once(buildEventId(event, videoId), id => {
            const mediaEvent = MediaEvent(videoId, 'video', event);
            ophanRecord(mediaEvent);
            window.ga(
                `${gaTracker}.send`,
                'event',
                buildGoogleAnalyticsEvent(
                    mediaEvent,
                    events.metricMap,
                    id,
                    'gu-video-youtube',
                    eventAction,
                    event.mediaId
                )
            );
        });
    });
};

const trackYoutubeEvent = (event, id) => {
    mediator.emit(buildEventId(event, id), id);
};

export { trackYoutubeEvent, initYoutubeEvents };
