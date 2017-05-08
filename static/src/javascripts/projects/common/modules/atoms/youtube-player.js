// @flow
import fastdom from 'fastdom';

import { loadScript } from 'lib/load-script';

const scriptSrc = 'https://www.youtube.com/iframe_api';
const promise = new Promise(resolve => {
    if (window.YT && window.YT.Player) {
        resolve();
    } else {
        window.onYouTubeIframeAPIReady = resolve;
    }
});

const loadYoutubeJs = () => {
    loadScript(scriptSrc, {});
};

const addVideoStartedClass = el => {
    el.classList.add('youtube__video-started');
};

const onPlayerStateChangeEvent = (event, handlers, el) => {
    // change class according to the current state
    // TODO: Fix this so we can add poster image.
    fastdom.write(() => {
        ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(status => {
            el.classList.toggle(
                `youtube__video-${status.toLocaleLowerCase()}`,
                event.data === window.YT.PlayerState[status]
            );
        });
        addVideoStartedClass(el);
    });

    if (handlers && typeof handlers.onPlayerStateChange === 'function') {
        handlers.onPlayerStateChange(event);
    }
};

const onPlayerReadyEvent = (event, handlers, el) => {
    fastdom.write(() => {
        el.classList.add('youtube__video-ready');
    });

    if (handlers && typeof handlers.onPlayerReady === 'function') {
        handlers.onPlayerReady(event);
    }
};

const setupPlayer = (id, onPlayerReady, onPlayerStateChange) =>
    new window.YT.Player(id, {
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
        },
    });

const hasPlayerStarted = event => event.target.getCurrentTime() > 0;

const init = (el: HTMLElement, handlers: {}, videoId: string) => {
    loadYoutubeJs();

    return promise.then(() => {
        const onPlayerStateChange = event => {
            onPlayerStateChangeEvent(event, handlers, el);
        };

        const onPlayerReady = event => {
            if (hasPlayerStarted(event)) {
                addVideoStartedClass(el);
            }

            onPlayerReadyEvent(event, handlers, el);
        };

        return setupPlayer(videoId, onPlayerReady, onPlayerStateChange);
    });
};

export { init };
