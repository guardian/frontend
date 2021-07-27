import { initYoutubePlayer } from '../../../common/modules/atoms/youtube-player';
import {
    trackYoutubeEvent,
    initYoutubeEvents,
} from '../../../common/modules/atoms/youtube-tracking';
import mediator from '../../../../lib/mediator';

// https://developers.google.com/youtube/iframe_api_reference


const EVENTSFIRED = [];

const sendPercentageCompleteEvents = (
    atomId,
    youtubePlayer,
    playerTotalTime
) => {
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

export const initHostedYoutube = (el) => {
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
            onPlayerStateChange(event) {
                const player = event.target;

                // update current time
                const currentTime = Math.floor(player.getCurrentTime());
                const seconds = currentTime % 60;
                const minutes = (currentTime - seconds) / 60;
                youtubeTimer.textContent =
                    minutes + (seconds < 10 ? ':0' : ':') + seconds;


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
        },
        el.dataset.assetId
    );
};
