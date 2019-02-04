// @flow
import fastdom from 'lib/fastdom-promise';
import bonzo from 'bonzo';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';
import { initYoutubePlayer } from 'common/modules/atoms/youtube-player';
import {
    trackYoutubeEvent,
    initYoutubeEvents,
} from 'common/modules/atoms/youtube-tracking';
import { Component } from 'common/modules/component';
import $ from 'lib/$';
import config from 'lib/config';
import { isIOS, isAndroid, isBreakpoint } from 'lib/detect';
import debounce from 'lodash/debounce';
import { isOn as accessibilityIsOn } from 'common/modules/accessibility/main';

declare class YoutubePlayer extends EventTarget {
    playVideo: () => void;
    getVideoData: () => {
        video_id: string,
    };
    pauseVideo: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlayerState: () => -1 | 0 | 1 | 2 | 3 | 4 | 5;
}

declare class YoutubePlayerEvent {
    data: -1 | 0 | 1 | 2 | 3 | 4 | 5;
    target: YoutubePlayer;
}

interface AtomPlayer {
    iframe: HTMLIFrameElement;
    trackingId: string;
    youtubeId: string;
    youtubePlayer: YoutubePlayer;
    pendingTrackingCalls: Array<number>;
    paused: boolean;
    overlay?: HTMLElement;
    endSlate?: Component;
    duration?: number;
    progressTracker?: ?IntervalID;
}

const players: {
    [string]: AtomPlayer,
} = {};

const iframes = [];

document.addEventListener('focusout', () => {
    iframes.forEach(iframe => {
        fastdom
            .read(() => {
                if (document.activeElement === iframe) {
                    return $('.vjs-big-play-button', iframe.parentElement);
                }
            })
            .then(($playButton: ?bonzo) => {
                fastdom.write(() => {
                    if ($playButton) {
                        $playButton.addClass('youtube-play-btn-focussed');
                    }
                });
            });
    });
});

document.addEventListener('focusin', () => {
    fastdom
        .read(() => $('.vjs-big-play-button'))
        .then(($playButton: ?bonzo) => {
            fastdom.write(() => {
                if ($playButton) {
                    $playButton.removeClass('youtube-play-btn-focussed');
                }
            });
        });
});

const recordPlayerProgress = (atomId: string): void => {
    const player = players[atomId];

    if (!player) {
        return;
    }

    const { pendingTrackingCalls } = player;

    if (!pendingTrackingCalls.length) {
        return;
    }

    const { youtubePlayer, duration, trackingId } = player;
    const currentTime = youtubePlayer.getCurrentTime();

    if (duration) {
        const percentPlayed = Math.round((currentTime / duration) * 100);

        if (
            pendingTrackingCalls.length &&
            percentPlayed >= pendingTrackingCalls[0]
        ) {
            trackYoutubeEvent(pendingTrackingCalls[0].toString(), trackingId);
            pendingTrackingCalls.shift();
        }
    }
};

const killProgressTracker = (atomId: string): void => {
    if (players[atomId].progressTracker) {
        clearInterval(players[atomId].progressTracker);
    }
};

const setProgressTracker = (atomId: string): IntervalID => {
    players[atomId].progressTracker = setInterval(
        recordPlayerProgress.bind(null, atomId),
        1000
    );
    return players[atomId].progressTracker;
};

const handlePlay = (atomId: string, player: AtomPlayer): void => {
    const { trackingId, iframe, overlay, endSlate } = player;

    killProgressTracker(atomId);
    setProgressTracker(atomId);

    // don't track play if resumed from a paused state
    if (player.paused) {
        player.paused = false;
    } else {
        trackYoutubeEvent('play', trackingId);
    }

    const mainMedia = iframe.closest('.immersive-main-media');

    if (mainMedia) {
        mainMedia.classList.add('atom-playing');
    }

    if (overlay && endSlate) {
        const parentElem = overlay.parentElement;

        if (parentElem) {
            endSlate.fetch(parentElem, 'html');
        }
    }
};

const onPlayerPlaying = (atomId: string): void => {
    const player = players[atomId];

    if (!player) {
        return;
    }

    const { youtubePlayer, youtubeId } = players[atomId];

    /**
     * Get the youtube video id from the video currently playing.
     * We want to compare with the youtube ID in memory. If they differ
     * a related video has begun playing, so we need to get the atom ID
     * for tracking.
     */
    const latestYoutubeId = youtubePlayer.getVideoData().video_id;

    if (youtubeId !== latestYoutubeId) {
        fetchJson(`/atom/youtube/${latestYoutubeId}.json`)
            .then(resp => {
                const activeAtomId = resp.atomId;
                if (!activeAtomId) {
                    return;
                }
                // Update trackingId, youtubeId and duration for new youtube video.
                player.trackingId = activeAtomId;
                player.youtubeId = latestYoutubeId;
                player.duration = youtubePlayer.getDuration();
                handlePlay(atomId, player);
            })
            .catch(err => {
                reportError(
                    Error(
                        `Failed to get atom ID for youtube ID ${youtubeId}. ${err}`
                    ),
                    { feature: 'youtube' },
                    false
                );
            });
    } else {
        handlePlay(atomId, player);
    }
};

const onPlayerPaused = (atomId: string): void => {
    const player = players[atomId];

    player.paused = true;

    killProgressTracker(atomId);
};

const onPlayerEnded = (atomId: string): void => {
    const player = players[atomId];

    killProgressTracker(atomId);

    trackYoutubeEvent('end', player.trackingId);

    player.pendingTrackingCalls = [25, 50, 75];

    const mainMedia =
        (player.iframe && player.iframe.closest('.immersive-main-media')) ||
        null;
    if (mainMedia) {
        mainMedia.classList.remove('atom-playing');
    }
};

const STATES = {
    ENDED: onPlayerEnded,
    PLAYING: onPlayerPlaying,
    PAUSED: onPlayerPaused,
};

const shouldAutoplay = (atomId: string): boolean => {
    const isAutoplayBlockingPlatform = () => isIOS() || isAndroid();

    const isInternalReferrer = (): boolean => {
        if (config.get('page.isDev')) {
            return document.referrer.indexOf(window.location.origin) === 0;
        }

        return document.referrer.indexOf(config.get('page.host')) === 0;
    };

    const isMainVideo = (): boolean =>
        (players[atomId].iframe &&
            !!players[atomId].iframe.closest(
                'figure[data-component="main video"]'
            )) ||
        false;

    const flashingElementsAllowed = (): boolean =>
        accessibilityIsOn('flashing-elements');

    const isVideoArticle = (): boolean =>
        config.get('page.contentType', '').toLowerCase() === 'video';

    const isFront = () => config.get('page.isFront');

    return (
        ((isVideoArticle() && isInternalReferrer() && isMainVideo()) ||
            isFront()) &&
        !isAutoplayBlockingPlatform() &&
        flashingElementsAllowed()
    );
};

const getEndSlate = (overlay: HTMLElement): ?Component => {
    const overlayParent = overlay.parentNode;

    if (overlayParent instanceof HTMLElement) {
        const dataset = overlayParent.dataset || {};
        const endSlate = dataset.endSlate;

        if (endSlate) {
            const component = new Component();

            component.endpoint = endSlate;

            return component;
        }

        return undefined;
    }

    return undefined;
};

const updateImmersiveButtonPos = (): void => {
    const player = document.querySelector(
        '.immersive-main-media__media .youtube-media-atom'
    );
    const playerHeight = player ? player.offsetHeight : 0;
    const headline = document.querySelector(
        '.immersive-main-media__headline-container'
    );
    const headlineHeight = headline ? headline.offsetHeight : 0;
    const buttonOffset = playerHeight - headlineHeight;
    const immersiveInterface = document.querySelector(
        '.youtube-media-atom__immersive-interface'
    );

    if (immersiveInterface) {
        immersiveInterface.style.top = `${buttonOffset}px`;
    }
};

const onPlayerReady = (
    trackingId: string,
    atomId: string,
    iframeId: string,
    overlay: ?HTMLElement,
    event: YoutubePlayerEvent
): void => {
    const iframe = ((document.getElementById(
        iframeId
    ): any): HTMLIFrameElement);

    if (!iframe) {
        return;
    }

    iframes.push(iframe);

    const youtubePlayer = event.target;
    const youtubeId = youtubePlayer.getVideoData().video_id;
    const duration = youtubePlayer.getDuration();

    players[atomId] = {
        iframe,
        trackingId,
        youtubeId,
        duration,
        youtubePlayer,
        paused: false,
        pendingTrackingCalls: [25, 50, 75],
    };

    if (shouldAutoplay(atomId)) {
        event.target.playVideo();
    }

    if (overlay) {
        players[atomId].overlay = overlay;

        if (
            !!config.get('page.section') &&
            !config.get('switches.youtubeRelatedVideos') &&
            isBreakpoint({
                min: 'desktop',
            })
        ) {
            players[atomId].endSlate = getEndSlate(overlay);
        }
    }

    if (iframe.closest('.immersive-main-media__media')) {
        updateImmersiveButtonPos();

        window.addEventListener(
            'resize',
            debounce(updateImmersiveButtonPos.bind(null), 200)
        );
    }
};

const onPlayerStateChange = (
    atomId: string,
    event: YoutubePlayerEvent
): void => {
    const stateId = event.data;

    const stateKey = Object.keys(STATES).find(
        key => stateId === window.YT.PlayerState[key]
    );

    if (stateKey) {
        STATES[stateKey](atomId);
    }
};

const getUniqueAtomId = (atomId: string): string =>
    `${atomId}/${Math.random()
        .toString(36)
        .substr(2, 9)}`;

const initYoutubePlayerForElem = (el: ?HTMLElement): void => {
    fastdom.read(() => {
        if (!el) return;

        const iframePlaceholder = el.querySelector(
            '.youtube-media-atom__iframe'
        );

        if (!iframePlaceholder) {
            return;
        }

        const iframeId = iframePlaceholder.id;

        // trackingId must be the original atom ID from CAPI
        const trackingId = el.getAttribute('data-media-atom-id') || '';
        /**
         * atomId is a unique key we use for in the "players" object.
         * Because the same atomId could exist multipe times we need to make
         * this key unique.
         * */
        const atomId = getUniqueAtomId(trackingId);

        el.setAttribute('data-unique-atom-id', atomId);

        const overlay = el.querySelector('.youtube-media-atom__overlay');

        const channelId = el.getAttribute('data-channel-id') || '';

        initYoutubeEvents(trackingId);

        initYoutubePlayer(
            iframePlaceholder,
            {
                onPlayerReady: (event: YoutubePlayerEvent) => {
                    onPlayerReady(trackingId, atomId, iframeId, overlay, event);
                },
                onPlayerStateChange: (event: YoutubePlayerEvent) => {
                    onPlayerStateChange(atomId, event);
                },
            },
            iframePlaceholder.dataset.assetId,
            channelId
        );
    });
};

const checkElemForVideo = (elem: ?HTMLElement): void => {
    if (!elem) return;

    fastdom.read(() => {
        $('.youtube-media-atom:not(.no-player)', elem).each(el => {
            const overlay = el.querySelector('.youtube-media-atom__overlay');

            if (config.get('page.isFront')) {
                overlay.addEventListener('click', () => {
                    initYoutubePlayerForElem(el);
                });
            } else {
                initYoutubePlayerForElem(el);
            }
        });
    });
};

export const checkElemsForVideos = (elems: ?Array<HTMLElement>): void => {
    if (elems && elems.length) {
        elems.forEach(checkElemForVideo);
    } else {
        checkElemForVideo(document.body);
    }
};

export const onVideoContainerNavigation = (atomId: string): void => {
    const player = players[atomId];
    if (player) {
        player.youtubePlayer.pauseVideo();
    }
};
