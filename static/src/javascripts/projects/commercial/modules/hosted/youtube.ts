import {
    addCancelListener,
    canAutoplay as canAutoplayNextVideo,
    init as initNextVideoAutoPlay,
    triggerAutoplay,
    triggerEndSlate,
} from 'commercial/modules/hosted/next-video-autoplay';
import { isOn } from 'common/modules/accessibility/main';
import { initYoutubePlayer } from 'common/modules/atoms/youtube-player';
import {
    initYoutubeEvents,
    trackYoutubeEvent,
} from 'common/modules/atoms/youtube-tracking';
import config from 'lib/config';
import { isBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';

// https://developers.google.com/youtube/iframe_api_reference
type YouTubePlayer = {
    getCurrentTime: () => number;
    getDuration: () => number;
    fullscreener: () => void;
    playVideo: () => void;
    pauseVideo: () => void;
    stopVideo: () => void;
};

type Page = {
    isDev: boolean;
    contentType: string;
    host: string;
    productionOffice: string;
};

const EVENTSFIRED = [];

const isDesktop: boolean = isBreakpoint({ min: 'desktop' });

const shouldAutoplay = (
    page: Page,
    switches: { hostedVideoAutoplay: boolean | null | undefined }
): boolean => {
    const flashingElementsAllowed = () => isOn('flashing-elements');
    const isVideoArticle = () => page.contentType.toLowerCase() === 'video';
    const isUSContent = () => page.productionOffice.toLowerCase() === 'us';
    const isSwitchedOn = switches.hostedVideoAutoplay || false;

    if (!page.contentType || !page.productionOffice) {
        return false;
    }

    return (
        isSwitchedOn &&
        isUSContent() &&
        isVideoArticle() &&
        flashingElementsAllowed()
    );
};

const sendPercentageCompleteEvents = (
    atomId: string,
    youtubePlayer: YouTubePlayer,
    playerTotalTime: number
): void => {
    const quartile = playerTotalTime / 4;
    const playbackEvents = {
        '25': quartile,
        '50': quartile * 2,
        '75': quartile * 3,
    };

    Object.keys(playbackEvents).forEach((key) => {
        const value = playbackEvents[key];
        if (
            !EVENTSFIRED.includes(key) &&
            youtubePlayer.getCurrentTime() > value
        ) {
            trackYoutubeEvent(key, atomId);
            EVENTSFIRED.push(key);
            mediator.emit(key);
        }
    });
};

export const initHostedYoutube = (el: HTMLElement): void => {
    const atomId = el.getAttribute('data-media-id') || null;
    const duration = Number(el.getAttribute('data-duration')) || null;

    if (!atomId || !duration) {
        return;
    }

    const youtubeTimer = document.getElementsByClassName(
        'js-youtube-current-time'
    )[0];

    let playTimer;

    initYoutubeEvents(atomId);
    initYoutubePlayer(
        el,
        {
            onPlayerStateChange(event: {
                data: unknown;
                target: YouTubePlayer;
            }) {
                const player = event.target;

                // show end slate when movie finishes
                if (event.data === window.YT.PlayerState.ENDED) {
                    trackYoutubeEvent('end', atomId);
                    youtubeTimer.textContent = '0:00';
                    if (canAutoplayNextVideo()) {
                        // on mobile show the next video link in the end of the currently watching video
                        if (!isDesktop) {
                            triggerEndSlate();
                        }
                    }
                } else {
                    // update current time
                    const currentTime = Math.floor(player.getCurrentTime());
                    const seconds = currentTime % 60;
                    const minutes = (currentTime - seconds) / 60;
                    youtubeTimer.textContent =
                        minutes + (seconds < 10 ? ':0' : ':') + seconds;
                }

                if (event.data === window.YT.PlayerState.PLAYING) {
                    trackYoutubeEvent('play', atomId);
                    const playerTotalTime = player.getDuration();
                    playTimer = setInterval(() => {
                        sendPercentageCompleteEvents(
                            atomId,
                            player,
                            playerTotalTime
                        );
                    }, 1000);
                } else {
                    window.clearInterval(playTimer);
                }
            },
            onPlayerReady(event: { target: YouTubePlayer }) {
                if (
                    shouldAutoplay(
                        config.get('page', {}),
                        config.get('switches', {})
                    )
                ) {
                    event.target.playVideo();
                }
                initNextVideoAutoPlay().then(() => {
                    if (canAutoplayNextVideo() && isDesktop) {
                        addCancelListener();
                        triggerAutoplay(
                            event.target.getCurrentTime.bind(event.target),
                            duration
                        );
                    }
                });
            },
        },
        el.dataset.assetId
    );
};
