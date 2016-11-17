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

    var STATES = {
        'ENDED': _onPlayerEnded,
        'PLAYING': _onPlayerPlaying,
        'PAUSED': _onPlayerPaused
    };

    var progressTracker = {};
    var players = {};

    function init() {

        fastdom.read(function () {
                        $('.atom--media--youtube').each(function (el) {
                            var atomId = el.getAttribute('data-media-atom-id');
                            var videoId = el.firstElementChild.id;
                            tracking.init(atomId);
                            players[videoId] = youtubePlayer.init(el,
                                {
                                    onPlayerStateChange: function (event) {
                                        Object.keys(STATES).forEach(checkState.bind(null, videoId, atomId, event.data, event.target));
                                    },
                                    onPlayerReady: function (event) {
                                        var player = event.target;
                                        // Record the duration for percentage calculation.
                                        player.duration = player.getDuration();
                                    }
                    }
                    , videoId);
            })
        });
    }

    function checkState(id, atomId, state, player, status) {
        if (state === window.YT.PlayerState[status] && STATES[status]) {
            STATES[status](id, atomId, player);
        }
    }

    function _onPlayerPlaying(id, atomId, player) {
        setProgressTracker(id, atomId, player);
        tracking.track('play', atomId);
    }

    function _onPlayerPaused(id) {
        killProgressTracker(false, id);
    }

    function _onPlayerEnded(id, atomId) {
        killProgressTracker(false, id);
        tracking.track('end', atomId);
    }

    function setProgressTracker(id, atomId, player)  {
        killProgressTracker(true);
        progressTracker.id = id;
        progressTracker.tracker = setInterval(recordPlayerProgress.bind(null, atomId, player), 1000);
    }

    function killProgressTracker(force, id) {
        if (progressTracker.tracker &&
            (force || id === progressTracker.id)) {
            clearInterval(progressTracker.tracker);
            progressTracker = {};
        }
    }

    function recordPlayerProgress(atomId, player) {
            var currentTime = player.getCurrentTime(),
                percentPlayed = Math.round(((currentTime / player.duration) * 100));

            if (percentPlayed > 0 && percentPlayed < 100 &&
                percentPlayed % 25 === 0) {
                tracking.track(percentPlayed, atomId);
            }
    }

    return {
        init: init
    }
});
