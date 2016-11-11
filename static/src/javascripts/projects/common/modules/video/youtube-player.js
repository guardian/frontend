define([
    'fastdom',
    'Promise',
    'common/utils/$',
    'common/utils/load-script',
    'common/modules/video/youtube-tracking'
], function (
    fastdom,
    Promise,
    $,
    loadScript,
    tracking
) {
    var scriptId = 'youtube-script';
    var scriptSrc = 'https://www.youtube.com/iframe_api';
    var promise = new Promise(function(resolve) {
        window.onYouTubeIframeAPIReady = resolve;
    });

    var players = {},
        progressTracker = {};

    var STATES = {
        'ENDED': _onPlayerEnded,
        'PLAYING': _onPlayerPlaying,
        'PAUSED': _onPlayerPaused
    };

    fastdom.read(function() {
        $('.atom--media--youtube').each(function(el) {
            init(el, tracking, el.firstElementChild.id, initTracking);
        });
    });

    function initTracking(atomId) {
        tracking.init(atomId);
    }

    function loadYoutubeJs() {
        fastdom.write(function () {
            loadScript({ id: scriptId, src: scriptSrc });
        }, this);
    }

    function prepareWrapper(el) {
        var wrapper = document.createElement('div');
        wrapper.className += el.className;

        fastdom.write(function () {
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);
        });

        return wrapper;
    }

    function checkState(id, atomId, state, status) {
        if (state === window.YT.PlayerState[status] && STATES[status]) {
            STATES[status](id, atomId);
        }
    }

    function _onPlayerStateChange(event, handlers, wrapper, videoId, atomId) {
        //change class according to the current state
        //TODO: Fix this so we can add poster image.
        fastdom.write(function () {
            ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(function (status) {
                wrapper.classList.toggle('youtube__video-' + status.toLocaleLowerCase(), event.data === window.YT.PlayerState[status]);
            });
            wrapper.classList.add('youtube__video-started');
        });

        Object.keys(STATES).forEach(checkState.bind(null, videoId, atomId, event.data));

        if (handlers && typeof handlers.onPlayerStateChange === 'function') {
            handlers.onPlayerStateChange(event);
        }
    }

    function _onPlayerReady(event, handlers, wrapper, videoId) {

        // Record the duration for percentage calculation.
        players[videoId].duration = players[videoId].player.getDuration();

        fastdom.write(function () {
            wrapper.classList.add('youtube__video-ready');
        });
        if (handlers && typeof handlers.onPlayerReady === 'function') {
            handlers.onPlayerReady(event);
        }
    }

    function _onPlayerPlaying(id, atomId) {
        setProgressTracker(id, atomId);
        tracking.track('play', atomId);
    }

    function _onPlayerPaused(id) {
        killProgressTracker(false, id);
    }

    function _onPlayerEnded(id, atomId) {
        killProgressTracker(false, id);
        tracking.track('end', atomId);
    }

    function setProgressTracker(id, atomId)  {
        killProgressTracker(true);
        progressTracker.id = id;
        progressTracker.tracker = setInterval(recordPlayerProgress.bind(null, id, atomId), 1000);
    }

    function killProgressTracker(force, id) {
        if (progressTracker.tracker &&
            (force || id === progressTracker.id)) {
            clearInterval(progressTracker.tracker);
            progressTracker = {};
        }
    }

    function init(el, handlers, videoId, tracking) {
        //wrap <iframe/> in a div with dynamically updating class attributes
        loadYoutubeJs();
        var wrapper = prepareWrapper(el);
        var atomId = el.getAttribute('data-media-atom-id');

        if (tracking && typeof tracking === 'function') {
            tracking(atomId);
        }

        return promise.then(function () {
            function onPlayerStateChange(event) {
                _onPlayerStateChange(event, handlers, wrapper, videoId, atomId);
            }

            function onPlayerReady(event) {
                _onPlayerReady(event, handlers, wrapper, videoId);
            }

            players[videoId] = {
                player: setupPlayer(videoId, onPlayerReady, onPlayerStateChange)
            };

            return players[videoId].player;
        });
    }

    function setupPlayer(id, onPlayerReady, onPlayerStateChange) {
        return new window.YT.Player(id, {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function recordPlayerProgress(id, atomId) {

        var currentTime = players[id].player.getCurrentTime(),
            percentPlayed = Math.round(((currentTime / players[id].duration) * 100));

        if (percentPlayed > 0 &&
            percentPlayed % 25 === 0) {
            tracking.track(percentPlayed, atomId);
        }
    }

    return {
        init: init
    };
});
