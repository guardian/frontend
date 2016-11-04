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

    function initYoutubeEvents(videoId) {

        var ga = window.ga,
            gaTracker = config.googleAnalytics.trackers.editorial;

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
                eventLabel: window.location.pathname,
                dimension19: self.trackingId,
                dimension20: 'guardian-youtube'
            }
        };

        var eventList = ['play', '25', '50', '75', 'end'];

        forEach(eventList, function(event) {
            mediator.once(event, function() {
                ophanRecord(event);
                ga(gaTracker + '.send', 'event',
                    gaHelper.buildGoogleAnalyticsEvent(event, events, window.location.pathname,
                        'gu-video-youtube', eventAction, videoId));
            });
        });

        function ophanRecord(event) {
            require(['ophan/ng'], function (ophan) {
                var eventObject = {
                    video: {
                        id: 'gu-video-youtube-' + videoId,
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

    function track(property) {
        mediator.emit(property);
    }

    return {
        track: track,
        init: init
    };

});
