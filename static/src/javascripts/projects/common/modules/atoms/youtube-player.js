import fastdom from 'fastdom';
import Promise from 'Promise';
import $ from 'lib/$';
import loadScript from 'lib/load-script';
var scriptSrc = 'https://www.youtube.com/iframe_api';
var promise = new Promise(function(resolve) {
    if (window.YT && window.YT.Player) {
        resolve();
    } else {
        window.onYouTubeIframeAPIReady = resolve;
    }
});

function loadYoutubeJs() {
    loadScript.loadScript(scriptSrc);
}

function _onPlayerStateChange(event, handlers, el) {
    //change class according to the current state
    //TODO: Fix this so we can add poster image.
    fastdom.write(function() {
        ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(function(status) {
            el.classList.toggle('youtube__video-' + status.toLocaleLowerCase(), event.data === window.YT.PlayerState[status]);
        });
        addVideoStartedClass(el);
    });



    if (handlers && typeof handlers.onPlayerStateChange === 'function') {
        handlers.onPlayerStateChange(event);
    }
}

function _onPlayerReady(event, handlers, el) {
    fastdom.write(function() {
        el.classList.add('youtube__video-ready');
    });

    if (handlers && typeof handlers.onPlayerReady === 'function') {
        handlers.onPlayerReady(event);
    }
}

function hasPlayerStarted(event) {
    return event.target.getCurrentTime() > 0;
}

function addVideoStartedClass(el) {
    el.classList.add('youtube__video-started');
}

function init(el, handlers, videoId) {
    loadYoutubeJs();

    return promise.then(function() {
        function onPlayerStateChange(event) {
            _onPlayerStateChange(event, handlers, el);
        }

        function onPlayerReady(event) {
            if (hasPlayerStarted(event)) {
                addVideoStartedClass(el);
            }

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

export default {
    init: init
};
