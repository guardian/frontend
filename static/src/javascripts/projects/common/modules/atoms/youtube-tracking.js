import { mediator } from 'lib/mediator';
import config from 'lib/config';
import ophan from 'ophan/ng';

const buildEventId = (event, videoId) =>
    `${event}:${videoId}`;

const initYoutubeEvents = (videoId) => {
    const eventAction = 'video content';
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
            eventAction,
            eventLabel: videoId,
            dimension19: videoId,
            dimension20: 'gu-video-youtube',
        },
    };
    const ophanRecord = (event) => {
        const eventObject = {
            video: {
                id: `gu-video-youtube-${event.mediaId}`,
                eventType: `video:content:${event.eventType}`,
            },
        };
        ophan.record(eventObject);
    };

    ['play', '25', '50', '75', 'end'].forEach(event => {
        mediator.once(buildEventId(event, videoId), id => {
            const mediaEvent = {
                mediaId: videoId,
                mediaType: 'video',
                eventType: event,
                isPreroll: false,
            };
            ophanRecord(mediaEvent);
        });
    });

    ophanRecord({
        mediaId: videoId,
        mediaType: 'video',
        eventType: 'ready',
        isPreroll: false,
    });
};

const trackYoutubeEvent = (event, id) => {
    mediator.emit(buildEventId(event, id), id);
};

export { trackYoutubeEvent, initYoutubeEvents };
