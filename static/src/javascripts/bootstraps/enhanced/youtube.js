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
        players[atomId].pendingTrackingCalls = [25, 50, 75];
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

    function onPlayerReady(atomId, event) {
        players[atomId] = {
            player: event.target,
            pendingTrackingCalls: [25, 50, 75]
        };
    }

    function onPlayerStateChange(atomId, event) {
        Object.keys(STATES).forEach(checkState.bind(null, atomId, event.data));
    }

    function init() {
        fastdom.read(function () {
            $('.atom--media--youtube').each(function (el) {
                var atomId = el.getAttribute('data-media-atom-id');
                var iframe = el.querySelector('iframe');
                var youtubeId = iframe.id;

                tracking.init(atomId);

                youtubePlayer.init(iframe, {
                    onPlayerReady: onPlayerReady.bind(null, atomId),
                    onPlayerStateChange: onPlayerStateChange.bind(null, atomId)
                }, youtubeId);
            });
        });
    }

    return {
        init: init
    };
});
