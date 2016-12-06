define([
    'fastdom',
    'Promise',
    'common/utils/$',
    'common/utils/load-script'
], function (
    fastdom,
    Promise,
    $,
    loadScript
) {
    var scriptId = 'youtube-script';
    var scriptSrc = 'https://www.youtube.com/iframe_api';
    var promise = new Promise(function(resolve) {
        window.onYouTubeIframeAPIReady = resolve;
    });

    function loadYoutubeJs() {
        fastdom.write(function () {
            if (!document.querySelector(scriptId)) {
                loadScript({ id: scriptId, src: scriptSrc });
            }
        }, this);
    }

    function _onPlayerStateChange(event, handlers, el) {
        //change class according to the current state
        //TODO: Fix this so we can add poster image.
        fastdom.write(function () {
            ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(function (status) {
                el.classList.toggle('youtube__video-' + status.toLocaleLowerCase(), event.data === window.YT.PlayerState[status]);
            });
            el.classList.add('youtube__video-started');
        });



        if (handlers && typeof handlers.onPlayerStateChange === 'function') {
            handlers.onPlayerStateChange(event);
        }
    }

    function _onPlayerReady(event, handlers, el) {

        fastdom.write(function () {
            el.classList.add('youtube__video-ready');
        });
        if (handlers && typeof handlers.onPlayerReady === 'function') {
            handlers.onPlayerReady(event);
        }
    }

    function init(el, handlers, videoId) {
        loadYoutubeJs();

        return promise.then(function () {
            function onPlayerStateChange(event) {
                _onPlayerStateChange(event, handlers, el);
            }

            function onPlayerReady(event) {
                _onPlayerReady(event, handlers, el);
            }

            return setupPlayer(videoId, onPlayerReady, onPlayerStateChange);
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

    return {
        init: init
    };
});
