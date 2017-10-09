// @flow
import fastdom from 'fastdom';
import { initYoutubePlayer } from 'common/modules/atoms/youtube-player';
import {
    trackYoutubeEvent,
    initYoutubeEvents,
} from 'common/modules/atoms/youtube-tracking';
import { Component } from 'common/modules/component';
import $ from 'lib/$';
import config from 'lib/config';
import { isIOS, isAndroid, isBreakpoint } from 'lib/detect';
import debounce from 'lodash/functions/debounce';
import { isOn as accessibilityIsOn } from 'common/modules/accessibility/main';

const players = {};

// retrieves actual id of atom without appended index
const getTrackingId = (atomId: string): string => atomId.split('/')[0];

const recordPlayerProgress = (atomId: string): void => {
    const player = players[atomId].player;
    const pendingTrackingCalls = players[atomId].pendingTrackingCalls;

    if (!pendingTrackingCalls.length) {
        return;
    }

    if (!player.duration) {
        player.duration = player.getDuration();
    }

    const currentTime = player.getCurrentTime();
    const percentPlayed = Math.round(currentTime / player.duration * 100);

    if (percentPlayed >= pendingTrackingCalls[0]) {
        trackYoutubeEvent(pendingTrackingCalls[0], getTrackingId(atomId));
        pendingTrackingCalls.shift();
    }
};

const killProgressTracker = (atomId: string): void => {
    if (players[atomId].progressTracker) {
        clearInterval(players[atomId].progressTracker);
    }
};

const setProgressTracker = (atomId: string): number => {
    players[atomId].progressTracker = setInterval(
        recordPlayerProgress.bind(null, atomId),
        1000
    );
    return players[atomId].progressTracker;
};

const onPlayerPlaying = (atomId: string): void => {
    const player = players[atomId];

    killProgressTracker(atomId);
    setProgressTracker(atomId);
    trackYoutubeEvent('play', getTrackingId(atomId));

    const mainMedia =
        (player.iframe && player.iframe.closest('.immersive-main-media')) ||
        null;
    if (mainMedia) {
        mainMedia.classList.add('atom-playing');
    }

    if (
        player.endSlate &&
        !player.overlay.parentNode.querySelector('.end-slate-container')
    ) {
        player.endSlate.fetch(player.overlay.parentNode, 'html');
    }
};

const onPlayerPaused = (atomId: string): void => killProgressTracker(atomId);

const onPlayerEnded = (atomId: string): void => {
    const player = players[atomId];

    killProgressTracker(atomId);
    trackYoutubeEvent('end', getTrackingId(atomId));
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

const checkState = (atomId, state, status): void => {
    if (state === window.YT.PlayerState[status] && STATES[status]) {
        STATES[status](atomId);
    }
};

const shouldAutoplay = (atomId: string): boolean => {
    const isAutoplayBlockingPlatform = () => isIOS() || isAndroid();

    const isInternalReferrer = () => {
        if (config.page.isDev) {
            return document.referrer.indexOf(window.location.origin) === 0;
        }
        return document.referrer.indexOf(config.page.host) === 0;
    };

    const isMainVideo = () =>
        (players[atomId].iframe &&
            players[atomId].iframe.closest(
                'figure[data-component="main video"]'
            )) ||
        false;

    const flashingElementsAllowed = () =>
        accessibilityIsOn('flashing-elements');

    return (
        config.page.contentType === 'Video' &&
        isInternalReferrer() &&
        !isAutoplayBlockingPlatform() &&
        isMainVideo() &&
        flashingElementsAllowed()
    );
};

const getEndSlate = (overlay: HTMLElement): Component => {
    const overlayParent = ((overlay.parentNode: any): ?HTMLElement);

    const endSlatePath = overlayParent ? overlayParent.dataset.endSlate : null;
    const endSlate = new Component();

    endSlate.endpoint = endSlatePath;

    return endSlate;
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

const onPlayerReady = (atomId, overlay, iframe, event): void => {
    players[atomId] = {
        player: event.target,
        pendingTrackingCalls: [25, 50, 75],
        iframe,
    };

    if (shouldAutoplay(atomId)) {
        event.target.playVideo();
    }

    if (overlay) {
        players[atomId].overlay = overlay;

        if (
            !!config.page.section &&
            isBreakpoint({
                min: 'desktop',
            })
        ) {
            players[atomId].endSlate = getEndSlate(overlay);
        }
    }

    if (iframe && iframe.closest('.immersive-main-media__media')) {
        updateImmersiveButtonPos();
        window.addEventListener(
            'resize',
            debounce(updateImmersiveButtonPos.bind(null), 200)
        );
    }
};

const onPlayerStateChange = (atomId, event): void =>
    Object.keys(STATES).forEach(checkState.bind(null, atomId, event.data));

const checkElemForVideo = (elem: ?HTMLElement): void => {
    if (!elem) return;

    fastdom.read(() => {
        $('.youtube-media-atom', elem).each((el, index) => {
            const iframe = el.querySelector('iframe');

            if (!iframe) {
                return;
            }

            // append index of atom as iframe.id must be unique
            iframe.id += `/${index}`;

            // append index of atom as atomId must be unique
            const atomId = `${el.getAttribute('data-media-atom-id')}/${index}`;
            // need data attribute with index for unique lookup
            el.setAttribute('data-unique-atom-id', atomId);
            const overlay = el.querySelector('.youtube-media-atom__overlay');

            initYoutubeEvents(getTrackingId(atomId));

            initYoutubePlayer(
                iframe,
                {
                    onPlayerReady: onPlayerReady.bind(
                        null,
                        atomId,
                        overlay,
                        iframe
                    ),
                    onPlayerStateChange: onPlayerStateChange.bind(null, atomId),
                },
                iframe.id
            );
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
        player.player.pauseVideo();
    }
};
