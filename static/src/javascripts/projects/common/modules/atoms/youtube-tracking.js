define([
    'common/utils/mediator',
    'lodash/collections/forEach',
    'common/utils/config',
    'common/modules/video/ga-helper'
], function (
    mediator,
    forEach,
    config,
    gaHelper
) {

    function eventAction() {
        return 'video content';
    }

    function buildEventId(event, videoId) {
        return event + ':' + videoId;
    }

    function initYoutubeEvents(videoId) {

        var ga = window.ga;
        var gaTracker = config.googleAnalytics.trackers.editorial;

        var events = {
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
                dimension20: 'guardian-youtube'
            }
        };

        var eventsList = ['play', '25', '50', '75', 'end'];

        forEach(eventsList, function(event) {
            mediator.once(buildEventId(event, videoId), function(id) {
                var mediaEvent = MediaEvent(videoId, 'video', event);
                ophanRecord(mediaEvent);
                ga(gaTracker + '.send', 'event',
                    gaHelper.buildGoogleAnalyticsEvent(mediaEvent, events.metricMap, id,
                        'gu-video-youtube', eventAction, id));
            });
        });

        function ophanRecord(event) {
            require(['ophan/ng'], function (ophan) {
                var eventObject = {
                    video: {
                        id: 'gu-video-youtube-' + event.mediaId,
                        eventType: 'video:content:' + event.eventType
                    }
                };
                ophan.record(eventObject);
            });
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
            mediaId: mediaId,
            mediaType: mediaType,
            eventType: eventType
        };
    }

    function init(videoId) {
        initYoutubeEvents(videoId);
    }

    function track(event, id) {
        mediator.emit(buildEventId(event, id), id);
    }

    return {
        track: track,
        init: init
    };

});
