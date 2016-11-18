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

    function init() {

        fastdom.read(function () {
            $('.atom--media--youtube').each(function (el) {
                var atomId = el.getAttribute('data-media-atom-id');
                var youtubeId = el.firstElementChild.id;
                tracking.init(atomId);
                players[youtubeId] = youtubePlayer.init(el,
                    {
                        onPlayerStateChange: function (event) {

                            var STATES = {
                                'ENDED': onPlayerEnded,
                                'PLAYING': onPlayerPlaying,
                                'PAUSED': onPlayerPaused
                            };

                            var progressTracker = {};

                            function checkState(state, status) {
                                if (state === window.YT.PlayerState[status] && STATES[status]) {
                                    STATES[status]();
                                }
                            }

                            function onPlayerPlaying() {
                                setProgressTracker();
                                tracking.track('play', atomId);
                            }

                            function onPlayerPaused() {
                                killProgressTracker(false, youtubeId);
                            }

                            function onPlayerEnded() {
                                killProgressTracker(false, youtubeId);
                                tracking.track('end', atomId);
                            }

                            function setProgressTracker()  {
                                killProgressTracker(true);
                                progressTracker.id = youtubeId;
                                progressTracker.tracker = setInterval(recordPlayerProgress.bind(null), 1000);
                            }

                            function killProgressTracker(force, id) {
                                if (progressTracker.tracker &&
                                    (force || id === progressTracker.id)) {
                                    clearInterval(progressTracker.tracker);
                                    progressTracker = {};
                                }
                            }

                            function recordPlayerProgress() {
                                var player = event.target;

                                if (!player.duration) {
                                    player.duration = player.getDuration();
                                }

                                var currentTime = player.getCurrentTime();
                                var percentPlayed = Math.round(((currentTime / player.duration) * 100));

                                if (percentPlayed > 0 && percentPlayed < 100 &&
                                    percentPlayed % 25 === 0) {
                                    tracking.track(percentPlayed, atomId);
                                }
                            }

                            Object.keys(STATES).forEach(checkState.bind(null, event.data));
                        }
                    }
                    , youtubeId);
            });
        });
    }

    return {
        init: init
    };
});
