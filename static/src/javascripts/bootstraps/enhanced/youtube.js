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

    var progressTracker = {};

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

        if (!player.duration) {
            player.duration = player.getDuration();
        }

        var currentTime = player.getCurrentTime();
        var percentPlayed = Math.round(((currentTime / player.duration) * 100));

        if (percentPlayed > 0 && percentPlayed < 100 &&
            percentPlayed % 25 === 0,
            players[atomId].trackingCalls.indexOf(percentPlayed) === -1) {
            players[atomId].trackingCalls.push(percentPlayed);
            tracking.track(percentPlayed, atomId);
        }
    }

    function onPlayerReady(atomId, event) {
        players[atomId] = {
            player: event.target,
            trackingCalls: []
        };
    }

    function onPlayerStateChange(atomId, event) {
        Object.keys(STATES).forEach(checkState.bind(null, atomId, event.data));
    }

    function init() {
        fastdom.read(function () {
            $('.atom--media--youtube').each(function (el) {
                var atomId = el.getAttribute('data-media-atom-id');
                var youtubeId = el.firstElementChild.id;
                
                tracking.init(atomId);
                
                youtubePlayer.init(el, {
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
