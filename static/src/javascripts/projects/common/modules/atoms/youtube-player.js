// @flow
import fastdom from "fastdom";

import config from "lib/config";
import { loadScript } from "lib/load-script";
import {
    getAdConsentState,
    thirdPartyTrackingAdConsent
} from "common/modules/commercial/ad-prefs.lib";

const scriptSrc = "https://www.youtube.com/iframe_api";
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

const addVideoStartedClass = (el: ?HTMLElement) => {
    if (el) {
        el.classList.add("youtube__video-started");
    }
};

type Handlers = {
    onPlayerReady: (event: Object) => void,
    onPlayerStateChange: (event: Object) => void
};

const onPlayerStateChangeEvent = (
    event,
    handlers: Handlers,
    el: ?HTMLElement
) => {
    if (el && config.get("page.isDev")) {
        const states = window.YT.PlayerState;
        const state: ?string = Object.keys(states).find(
            key => states[key] === event.data
        );
        if (state) {
            console.log(`Player ${el.id} is ${state}`);
        }
    }

    // change class according to the current state
    // TODO: Fix this so we can add poster image.
    fastdom.write(() => {
        ["ENDED", "PLAYING", "PAUSED", "BUFFERING", "CUED"].forEach(status => {
            if (el) {
                el.classList.toggle(
                    `youtube__video-${status.toLocaleLowerCase()}`,
                    event.data === window.YT.PlayerState[status]
                );
                addVideoStartedClass(el);
            }
        });
    });

    if (handlers && typeof handlers.onPlayerStateChange === "function") {
        handlers.onPlayerStateChange(event);
    }
};

const onPlayerReadyEvent = (event, handlers: Handlers, el: ?HTMLElement) => {
    fastdom.write(() => {
        if (el) {
            el.classList.add("youtube__video-ready");
        }
    });

    // we should be able to remove this check once everything is using flow/ES^
    if (handlers && typeof handlers.onPlayerReady === "function") {
        handlers.onPlayerReady(event);
    }
};

const setupPlayer = (
    eltId: string,
    videoId: string,
    channelId?: string,
    onReady,
    onStateChange,
    onError
) => {
    const wantPersonalisedAds: boolean =
        getAdConsentState(thirdPartyTrackingAdConsent) !== false;
    const disableRelatedVideos = !config.get("switches.youtubeRelatedVideos");
    // relatedChannels needs to be an array, as per YouTube's IFrame Embed Config API
    const relatedChannels =
        !disableRelatedVideos && channelId ? [channelId] : [];

    console.log("relatedChannels -->", relatedChannels);
    console.log("videoId -->", videoId);
    console.log("disableRelatedVideos -->", disableRelatedVideos);

    return new window.YT.Player(eltId, {
        videoId,
        width: "100%",
        height: "100%",
        events: {
            onReady,
            onStateChange,
            onError
        },
        embedConfig: {
            adsConfig: {
                nonPersonalizedAd: !wantPersonalisedAds
            },
            relatedChannels,
            disableRelatedVideos
        }
    });
};

const hasPlayerStarted = event => event.target.getCurrentTime() > 0;

const getPlayerIframe = videoId =>
    document.getElementById(`youtube-${videoId}`);

export const initYoutubePlayer = (
    el: HTMLElement,
    handlers: Handlers,
    videoId: string,
    channelId?: string
): Promise<void> => {
    loadYoutubeJs();
    return promise.then(() => {
        const onPlayerStateChange = event => {
            onPlayerStateChangeEvent(event, handlers, getPlayerIframe(videoId));
        };

        const onPlayerReady = event => {
            const iframe = getPlayerIframe(videoId);
            if (hasPlayerStarted(event)) {
                addVideoStartedClass(iframe);
            }
            onPlayerReadyEvent(event, handlers, iframe);
        };

        const onPlayerError = event => {
            console.error(`YOUTUBE: ${event}`);
        };

        return setupPlayer(
            el.id,
            videoId,
            channelId,
            onPlayerReady,
            onPlayerStateChange,
            onPlayerError
        );
    });
};
