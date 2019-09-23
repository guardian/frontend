// @flow
import fastdom from 'fastdom';

import config from 'lib/config';
import { loadScript } from 'lib/load-script';
import { constructQuery } from 'lib/url';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { onIabConsentNotification } from '@guardian/consent-management-platform';

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

const addVideoStartedClass = (el: ?HTMLElement) => {
    if (el) {
        el.classList.add('youtube__video-started');
    }
};

type Handlers = {
    onPlayerReady: (event: Object) => void,
    onPlayerStateChange: (event: Object) => void,
};

let consentState;
onIabConsentNotification(state => {
    consentState = state[1] && state[2] && state[3] && state[4] && state[5];
});

const onPlayerStateChangeEvent = (
    event,
    handlers: Handlers,
    el: ?HTMLElement
) => {
    if (el && config.get('page.isDev')) {
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
        ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(status => {
            if (el) {
                el.classList.toggle(
                    `youtube__video-${status.toLocaleLowerCase()}`,
                    event.data === window.YT.PlayerState[status]
                );
                addVideoStartedClass(el);
            }
        });
    });

    if (handlers && typeof handlers.onPlayerStateChange === 'function') {
        handlers.onPlayerStateChange(event);
    }
};

const onPlayerReadyEvent = (event, handlers: Handlers, el: ?HTMLElement) => {
    fastdom.write(() => {
        if (el) {
            el.classList.add('youtube__video-ready');
        }
    });

    // we should be able to remove this check once everything is using flow/ES^
    if (handlers && typeof handlers.onPlayerReady === 'function') {
        handlers.onPlayerReady(event);
    }
};

const createAdsConfig = (
    adFree: boolean,
    wantPersonalisedAds: boolean,
    isPfpAdTargetingSwitchedOn: boolean
): Object => {
    if (adFree) {
        return { disableAds: true };
    } else if (isPfpAdTargetingSwitchedOn) {
        return {
            nonPersonalizedAd: !wantPersonalisedAds,
            adTagParameters: {
                iu: config.get('page.adUnit'),
                cust_params: encodeURIComponent(
                    constructQuery(getPageTargeting())
                ),
            },
        };
    }
    return { nonPersonalizedAd: !wantPersonalisedAds };
};

const setupPlayer = (
    elt: HTMLElement,
    videoId: string,
    channelId?: string,
    onReady,
    onStateChange,
    onError
) => {
    const isPfpAdTargetingSwitchedOn: boolean = config.get(
        'switches.commercialYoutubePfpAdTargeting',
        false
    );
    const disableRelatedVideos = !config.get('switches.youtubeRelatedVideos');
    // relatedChannels needs to be an array, as per YouTube's IFrame Embed Config API
    const relatedChannels = [];
    /**
     * There's an issue with relatedChannels where
     * if we pass a populated array no related videos are
     * shown. Therefore for the time being we will pass an
     * empty array.
     */
    // const relatedChannels = !disableRelatedVideos && channelId ? [channelId] : [];

    const adsConfig = createAdsConfig(
        commercialFeatures.adFree,
        !!consentState,
        isPfpAdTargetingSwitchedOn
    );

    return new window.YT.Player(elt.id, {
        host:
            commercialFeatures.adFree ||
            !elt.classList.contains('youtube-media-atom__iframe')
                ? 'https://www.youtube-nocookie.com'
                : 'https://www.youtube.com',
        videoId,
        width: '100%',
        height: '100%',
        events: {
            onReady,
            onStateChange,
            onError,
        },
        embedConfig: {
            relatedChannels,
            disableRelatedVideos,
            adsConfig,
        },
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
            console.error(`YOUTUBE: ${event.data}`);
            console.dir(event);
        };

        return setupPlayer(
            el,
            videoId,
            channelId,
            onPlayerReady,
            onPlayerStateChange,
            onPlayerError
        );
    });
};

export const _ = { createAdsConfig };
