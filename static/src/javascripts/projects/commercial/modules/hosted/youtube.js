
define([
    'commercial/modules/hosted/next-video-autoplay',
    'common/modules/video/youtube-player',
    'common/modules/video/youtube-tracking',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'lodash/collections/contains',
    'lodash/collections/forEach'
], function (
    nextVideoAutoplay,
    youtubePlayer,
    tracking,
    $,
    detect,
    mediator,
    contains,
    forEach
) {
    var atomId;

    function isDesktop() {
        return contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint());
    }

    function sendPercentageCompleteEvents(youtubePlayer, playerTotalTime) {
        var quartile = playerTotalTime / 4;
        var playbackEvents = {
            'play': 0,
            '25': quartile,
            '50': quartile * 2,
            '75': quartile * 3,
            'end': playerTotalTime
        };

        forEach(playbackEvents, function(value, key) {
            if (youtubePlayer.getCurrentTime() > value) {
                tracking.track(key, atomId);
                mediator.emit(key);
            }
        });
    }

    function init(el) {
        var atomId = $(el).data('media-id');
        var duration = $(el).data('duration');
        var $currentTime = $('.js-youtube-current-time');
        var playTimer;

        tracking.init(atomId);
        youtubePlayer.init(el, {
            onPlayerStateChange: function (event) {
                var player = event.target;
                var ophanId = 'hosted-youtube-video';

                //show end slate when movie finishes
                if (event.data === window.YT.PlayerState.ENDED) {
                    tracking.track('end', atomId);
                    $currentTime.text('0:00');
                    if (nextVideoAutoplay.canAutoplay()) {
                        //on mobile show the next video link in the end of the currently watching video
                        if (!isDesktop()) {
                            nextVideoAutoplay.triggerEndSlate();
                        }
                    }
                } else {
                    //update current time
                    var currentTime = Math.floor(player.getCurrentTime());
                    var seconds = currentTime % 60;
                    var minutes = (currentTime - seconds) / 60;
                    $currentTime.text(minutes + (seconds < 10 ? ':0' : ':') + seconds);
                }

                //calculate completion and send event to ophan
                if (event.data === window.YT.PlayerState.PLAYING) {
                    tracking.track('play', atomId);
                    var playerTotalTime = player.getDuration();

                    playTimer = setInterval(function() {
                        sendPercentageCompleteEvents(player, playerTotalTime, ophanId);
                    }, 1000);
                } else {
                    clearTimeout(playTimer);
                }
            },
            onPlayerReady: function (event) {
                if (nextVideoAutoplay.canAutoplay() && isDesktop()) {
                    nextVideoAutoplay.addCancelListener();
                    nextVideoAutoplay.triggerAutoplay(event.target.getCurrentTime.bind(event.target), duration);
                }
            }
        }, el.id);
    }

    return {
        init: init
    };
});
