// @flow
import {
    init,
    canAutoplay,
    addCancelListener,
    triggerAutoplay,
    triggerEndSlate,
} from 'commercial/modules/hosted/next-video-autoplay';
import { initYoutubePlayer } from 'common/modules/atoms/youtube-player';
import {
    trackYoutubeEvent,
    initYoutubeEvents,
} from 'common/modules/atoms/youtube-tracking';
import { isBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';

type videoPlayerComponent = { getCurrentTime: () => number };

const EVENTSFIRED = [];

const isDesktop = (): boolean => isBreakpoint({ min: 'desktop' });

const sendPercentageCompleteEvents = (
    atomId: string,
    youtubePlayer: videoPlayerComponent,
    playerTotalTime: number
): void => {
    const quartile = playerTotalTime / 4;
    const playbackEvents = {
        '25': quartile,
        '50': quartile * 2,
        '75': quartile * 3,
    };

    Object.keys(playbackEvents).forEach(key => {
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
    const atomId: ?string = el.getAttribute('data-media-id');
    const duration: ?number = Number(el.getAttribute('data-duration'));

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
            onPlayerStateChange(event: Object) {
                const player = event.target;

                // show end slate when movie finishes
                if (event.data === window.YT.PlayerState.ENDED) {
                    trackYoutubeEvent('end', atomId);
                    youtubeTimer.textContent = '0:00';
                    if (canAutoplay()) {
                        // on mobile show the next video link in the end of the currently watching video
                        if (!isDesktop()) {
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
            onPlayerReady(event: Object) {
                init().then(() => {
                    if (canAutoplay() && isDesktop()) {
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
