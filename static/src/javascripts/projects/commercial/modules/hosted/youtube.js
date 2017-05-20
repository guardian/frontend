// @flow
import nextVideoAutoplay from 'commercial/modules/hosted/next-video-autoplay';
import { initYoutubePlayer } from 'common/modules/atoms/youtube-player';
import tracking from 'common/modules/atoms/youtube-tracking';
import $ from 'lib/$';
import detect from 'lib/detect';
import mediator from 'lib/mediator';

import type { bonzo } from 'bonzo';

type videoPlayerComponent = { getCurrentTime: () => number };

const EVENTSFIRED = [];

const isDesktop = (): boolean => detect.isBreakpoint({ min: 'desktop' });

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
            tracking.track(key, atomId);
            EVENTSFIRED.push(key);
            mediator.emit(key);
        }
    });
};

export const initHostedYoutube = (el: HTMLElement): void => {
    const atomId: string = $(el).data('media-id');
    const duration: number = $(el).data('duration');
    const $currentTime: bonzo = $('.js-youtube-current-time');
    let playTimer;

    tracking.init(atomId);
    initYoutubePlayer(
        el,
        {
            onPlayerStateChange(event: Object) {
                const player = event.target;

                // show end slate when movie finishes
                if (event.data === window.YT.PlayerState.ENDED) {
                    tracking.track('end', atomId);
                    $currentTime.text('0:00');
                    if (nextVideoAutoplay.canAutoplay()) {
                        // on mobile show the next video link in the end of the currently watching video
                        if (!isDesktop()) {
                            nextVideoAutoplay.triggerEndSlate();
                        }
                    }
                } else {
                    // update current time
                    const currentTime = Math.floor(player.getCurrentTime());
                    const seconds = currentTime % 60;
                    const minutes = (currentTime - seconds) / 60;
                    $currentTime.text(
                        minutes + (seconds < 10 ? ':0' : ':') + seconds
                    );
                }

                if (event.data === window.YT.PlayerState.PLAYING) {
                    tracking.track('play', atomId);
                    const playerTotalTime = player.getDuration();
                    playTimer = setInterval(() => {
                        sendPercentageCompleteEvents(
                            atomId,
                            player,
                            playerTotalTime
                        );
                    }, 1000);
                } else {
                    clearTimeout(playTimer);
                }
            },
            onPlayerReady(event: Object) {
                nextVideoAutoplay.init().then(() => {
                    if (nextVideoAutoplay.canAutoplay() && isDesktop()) {
                        nextVideoAutoplay.addCancelListener();
                        nextVideoAutoplay.triggerAutoplay(
                            event.target.getCurrentTime.bind(event.target),
                            duration
                        );
                    }
                });
            },
        },
        el.id
    );
};
