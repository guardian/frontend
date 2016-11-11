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
                eventCategory: 'Media',
                eventAction: 'video content',
                eventLabel: videoId,
                dimension19: videoId,
                dimension20: 'guardian-youtube'
            }
        };

        var eventsList = ['play', '25', '50', '75', 'end'];

        forEach(eventsList, function(event) {
            mediator.once(buildEventId(event, videoId), function(id) {
                ophanRecord(event, id);
                ga(gaTracker + '.send', 'event',
                    gaHelper.buildGoogleAnalyticsEvent(event, events, videoId,
                        'gu-video-youtube', eventAction, id));
            });
        });

        function ophanRecord(event, id) {
            require(['ophan/ng'], function (ophan) {
                var eventObject = {
                    video: {
                        id: 'gu-video-youtube-' + id,
                        eventType: 'video:content:' + event
                    }
                };
                ophan.record(eventObject);
            });
        }
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
