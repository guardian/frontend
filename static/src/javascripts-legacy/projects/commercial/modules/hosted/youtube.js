define([
    'commercial/modules/hosted/next-video-autoplay',
    'common/modules/atoms/youtube-player',
    'common/modules/atoms/youtube-tracking',
    'lib/$',
    'lib/detect',
    'lib/mediator',
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
    var eventsFired = [];

    function isDesktop() {
        return contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint());
    }

    function sendPercentageCompleteEvents(atomId, youtubePlayer, playerTotalTime) {
        var quartile = playerTotalTime / 4;
        var playbackEvents = {
            '25': quartile,
            '50': quartile * 2,
            '75': quartile * 3
        };

        forEach(playbackEvents, function (value, key) {
            if (!contains(eventsFired, key) && youtubePlayer.getCurrentTime() > value) {
                tracking.track(key, atomId);
                eventsFired.push(key);
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
        youtubePlayer.initYoutubePlayer(el, {
            onPlayerStateChange: function (event) {
                var player = event.target;

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

                if (event.data === window.YT.PlayerState.PLAYING) {
                    tracking.track('play', atomId);
                    var playerTotalTime = player.getDuration();
                    playTimer = setInterval(function () {
                        sendPercentageCompleteEvents(atomId, player, playerTotalTime);
                    }, 1000);
                } else {
                    clearTimeout(playTimer);
                }
            },
            onPlayerReady: function (event) {
                nextVideoAutoplay.init().then(function(){
                    if (nextVideoAutoplay.canAutoplay() && isDesktop()) {
                        nextVideoAutoplay.addCancelListener();
                        nextVideoAutoplay.triggerAutoplay(event.target.getCurrentTime.bind(event.target), duration);
                    }
                });
            }
        }, el.id);
    }

    return {
        init: init
    };
});
