// @flow
import fastdom from 'fastdom';

import { loadScript } from 'lib/load-script';
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent,
} from 'common/modules/commercial/ad-prefs.lib';

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

const addVideoStartedClass = (el: HTMLElement) => {
    el.classList.add('youtube__video-started');
};

type Handlers = {
    onPlayerReady: (event: Object) => void,
    onPlayerStateChange: (event: Object) => void,
};

const onPlayerStateChangeEvent = (
    event,
    handlers: Handlers,
    el: HTMLElement
) => {
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

const onPlayerReadyEvent = (event, handlers: Handlers, el: HTMLElement) => {
    fastdom.write(() => {
        el.classList.add('youtube__video-ready');
    });

    // we should be able to remove this check once everything is using flow/ES^
    if (handlers && typeof handlers.onPlayerReady === 'function') {
        handlers.onPlayerReady(event);
    }
};

const setupPlayer = (videoId: string, onReady, onStateChange) => {
    const wantPersonalisedAds: boolean =
        getAdConsentState(thirdPartyTrackingAdConsent) !== false;
    return new window.YT.Player(videoId, {
        events: {
            onReady,
            onStateChange,
        },
        embedConfig: {
            adsConfig: {
                nonPersonalizedAd: !wantPersonalisedAds,
            },
        },
    });
};

const hasPlayerStarted = event => event.target.getCurrentTime() > 0;

export const initYoutubePlayer = (
    el: HTMLElement,
    handlers: Handlers,
    videoId: string
): Promise<void> => {
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
