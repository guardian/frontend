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

    function _onPlayerStateChange(event, handlers, wrapper) {
        //change class according to the current state
        //TODO: Fix this so we can add poster image.
        fastdom.write(function () {
            ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(function (status) {
                wrapper.classList.toggle('youtube__video-' + status.toLocaleLowerCase(), event.data === window.YT.PlayerState[status]);
            });
            wrapper.classList.add('youtube__video-started');
        });



        if (handlers && typeof handlers.onPlayerStateChange === 'function') {
            handlers.onPlayerStateChange(event);
        }
    }

    function _onPlayerReady(event, handlers, wrapper) {

        fastdom.write(function () {
            wrapper.classList.add('youtube__video-ready');
        });
        if (handlers && typeof handlers.onPlayerReady === 'function') {
            handlers.onPlayerReady(event);
        }
    }

    function init(el, handlers, videoId) {
        //wrap <iframe/> in a div with dynamically updating class attributes
        loadYoutubeJs();
        var wrapper = prepareWrapper(el);

        return promise.then(function () {
            function onPlayerStateChange(event) {
                _onPlayerStateChange(event, handlers, wrapper);
            }

            function onPlayerReady(event) {
                _onPlayerReady(event, handlers, wrapper);
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
