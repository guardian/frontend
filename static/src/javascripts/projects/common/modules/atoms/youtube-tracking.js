// @flow
import mediator from 'lib/mediator';
import config from 'lib/config';
import ophan from 'ophan/ng';
import { buildGoogleAnalyticsEvent } from 'common/modules/video/ga-helper';
import type { MediaEvent } from 'common/modules/video/ga-helper';

const eventAction = (): string => 'video content';

const buildEventId = (event: string, videoId: string): string =>
    `${event}:${videoId}`;

const initYoutubeEvents = (videoId: string): void => {
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
            const mediaEvent: MediaEvent = {
                mediaId: videoId,
                mediaType: 'video',
                eventType: event,
                isPreroll: false,
            };
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
                    videoId
                )
            );
        });
    });
};

const trackYoutubeEvent = (event: string, id: string): void => {
    mediator.emit(buildEventId(event, id), id);
};

export { trackYoutubeEvent, initYoutubeEvents };
