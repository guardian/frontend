import mediator from 'lib/mediator';
import forEach from 'lodash/collections/forEach';
import config from 'lib/config';
import gaHelper from 'common/modules/video/ga-helper';
import ophan from 'ophan/ng';

function eventAction() {
    return 'video content';
}

function buildEventId(event, videoId) {
    return event + ':' + videoId;
}

function initYoutubeEvents(videoId) {

    const gaTracker = config.googleAnalytics.trackers.editorial;

    const events = {
        metricMap: {
            'play': 'metric1',
            'skip': 'metric2',
            '25': 'metric3',
            '50': 'metric4',
            '75': 'metric5',
            'end': 'metric6'
        },
        baseEventObject: {
            eventCategory: 'media',
            eventAction: eventAction(),
            eventLabel: videoId,
            dimension19: videoId,
            dimension20: 'gu-video-youtube'
        }
    };

    const eventsList = ['play', '25', '50', '75', 'end'];

    forEach(eventsList, event => {
        mediator.once(buildEventId(event, videoId), id => {
            const mediaEvent = MediaEvent(videoId, 'video', event);
            ophanRecord(mediaEvent);
            window.ga(gaTracker + '.send', 'event',
                gaHelper.buildGoogleAnalyticsEvent(mediaEvent, events.metricMap, id,
                    'gu-video-youtube', eventAction, event.mediaId));
        });
    });

    function ophanRecord(event) {
        const eventObject = {
            video: {
                id: 'gu-video-youtube-' + event.mediaId,
                eventType: 'video:content:' + event.eventType
            }
        };
        ophan.record(eventObject);
    }
}

/**
 *
 * @param mediaId {string}
 * @param mediaType {string} audio|video
 * @param eventType {string} e.g. firstplay, firstend
 * @param isPreroll {boolean}
 * @returns {{mediaId: string, mediaType: string, eventType: string, isPreroll: boolean}}
 */
function MediaEvent(mediaId, mediaType, eventType) {
    return {
        mediaId,
        mediaType,
        eventType
    };
}

function init(videoId) {
    initYoutubeEvents(videoId);
}

function track(event, id) {
    mediator.emit(buildEventId(event, id), id);
}

export default {
    track,
    init
};
