define([
    'fastdom',
    'common/modules/video/youtube-player',
    'common/modules/video/youtube-tracking',
    'common/utils/$'
], function (
    fastdom,
    youtubePlayer,
    tracking,
    $
) {

    var players = {};

    var STATES = {
        'ENDED': onPlayerEnded,
        'PLAYING': onPlayerPlaying,
        'PAUSED': onPlayerPaused
    };

    function checkState(atomId, state, status) {
        if (state === window.YT.PlayerState[status] && STATES[status]) {
            STATES[status](atomId);
        }
    }

    function onPlayerPlaying(atomId) {
        killProgressTracker(atomId);
        setProgressTracker(atomId);
        tracking.track('play', atomId);
    }

    function onPlayerPaused(atomId) {
        killProgressTracker(atomId);
    }

    function onPlayerEnded(atomId) {
        killProgressTracker(atomId);
        tracking.track('end', atomId);
        players[atomId].pendingTrackingCalls = [25, 50];
    }

    function setProgressTracker(atomId)  {
        players[atomId].progressTracker = setInterval(recordPlayerProgress.bind(null, atomId), 1000); 
    }

    function killProgressTracker(atomId) {
        if (players[atomId].progressTracker) {
            clearInterval(players[atomId].progressTracker);
        }
    }

    function recordPlayerProgress(atomId) {
        var player = players[atomId].player;
        var pendingTrackingCalls = players[atomId].pendingTrackingCalls;

        if (!pendingTrackingCalls.length) {
            return;
        }

        if (!player.duration) {
            player.duration = player.getDuration();
        }

        var currentTime = player.getCurrentTime();
        var percentPlayed = Math.round(((currentTime / player.duration) * 100));

        if (percentPlayed >= pendingTrackingCalls[0]) {
            tracking.track(pendingTrackingCalls[0], atomId);
            pendingTrackingCalls.shift();
        }
    }

    function onPlayerReady(atomId, overlay, event) {
        players[atomId] = {
            player: event.target,
            pendingTrackingCalls: [25, 50]
        };

        if (overlay) {
            setDuration(players[atomId].player.getDuration(), overlay);
        }
    }

    function setDuration(duration, overlay) {
        var times = [];

        var hours = Math.floor(duration / 3600);

        if (hours) {
            times.push(hours);
        }

        duration = duration - hours * 3600;

        var minutes = Math.floor(duration / 60);

        times.push(formatTime(minutes));

        duration = duration - minutes * 60;

        times.push(formatTime(duration));

        var formattedDuration = times.join(':');
        var durationElem = overlay.querySelector('.atom--media--youtube--control-bar--duration');

        durationElem.innerText = formattedDuration;
    }

    function formatTime(time) {
        return ('0' + time).slice(-2);
    }

    function onPlayerStateChange(atomId, event) {
        Object.keys(STATES).forEach(checkState.bind(null, atomId, event.data));
    }

    function init() {
        fastdom.read(function () {
            $('.atom--media--youtube').each(function (el) {
                var atomId = el.getAttribute('data-media-atom-id');
                var iframe = el.querySelector('iframe');
                var overlay = el.querySelector('.atom--media--youtube--overlay');
                var youtubeId = iframe.id;

                tracking.init(atomId);

                youtubePlayer.init(iframe, {
                    onPlayerReady: onPlayerReady.bind(null, atomId, overlay),
                    onPlayerStateChange: onPlayerStateChange.bind(null, atomId)
                }, youtubeId);
            });
        });
    }

    return {
        init: init
    };
});
