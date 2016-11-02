define([
    'common/utils/mediator',
    'lodash/collections/forEach'
], function (
    mediator,
    forEach
) {

    function track(property) {
        mediator.emit(property);
    }

    function initYoutubeEvents(videoId) {
        var eventList = ['play', '25', '50', '75', 'end'];

        forEach(eventList, function(event) {
            mediator.once(event, function() {
                ophanRecord(event);
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

    return {
        track: track,
        init: init
    };

});
