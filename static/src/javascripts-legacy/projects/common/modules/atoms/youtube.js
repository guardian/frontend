define([
    'fastdom',
    'common/modules/atoms/youtube-player',
    'common/modules/atoms/youtube-tracking',
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

    function onPlayerReady(atomId, overlay, event) {
        players[atomId] = {
            player: event.target,
            pendingTrackingCalls: [25, 50, 75]
        };

        if (overlay) {
            var formattedDuration = getFormattedDuration(players[atomId].player.getDuration());
            setDuration(formattedDuration, overlay);
        }
    }

    function getFormattedDuration(durationInSeconds) {
        var times = [];
        var hours = Math.floor(durationInSeconds / 3600);
        var minutes = Math.floor((durationInSeconds - hours * 3600) / 60);
        var seconds = (durationInSeconds - hours * 3600) - (minutes * 60);

        if (hours) {
            times.push(hours);
            times.push(formatTime(minutes));
        } else {
            times.push(minutes);
        }    
        times.push(formatTime(seconds));

        return times.join(':');
    }

    function formatTime(time) {
        return ('0' + time).slice(-2);
    }

    function setDuration(formattedDuration, overlay) {
        var durationElem = overlay.querySelector('.youtube-media-atom__bottom-bar__duration');

        durationElem.innerText = formattedDuration;
    }

    function onPlayerStateChange(atomId, event) {
        Object.keys(STATES).forEach(checkState.bind(null, atomId, event.data));
    }

    function checkElemsForVideos(elems) {
        if (elems && elems.length) {
            elems.forEach(checkElemForVideo);
        } else {
            checkElemForVideo(document.body);
        }
    }

    function checkElemForVideo(elem) {
        fastdom.read(function () {
            $('.youtube-media-atom', elem).each(function (el) {
                var atomId = el.getAttribute('data-media-atom-id');
                var iframe = el.querySelector('iframe');
                var overlay = el.querySelector('.youtube-media-atom__overlay');
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
        checkElemsForVideos: checkElemsForVideos
    };
});
