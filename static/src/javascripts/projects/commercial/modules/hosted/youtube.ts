import { initYoutubePlayer } from 'common/modules/atoms/youtube-player';
import {
	initYoutubeEvents,
	trackYoutubeEvent,
} from 'common/modules/atoms/youtube-tracking';
import { mediator } from 'lib/mediator';

type PlaybackEvents = { '25': number; '50': number; '75': number };

const EVENTSFIRED: string[] = [];

const sendPercentageCompleteEvents = (
	atomId: string,
	youtubePlayer: YT.Player,
	playerTotalTime: number,
): void => {
	const quartile = playerTotalTime / 4;
	const playbackEvents: PlaybackEvents = {
		'25': quartile,
		'50': quartile * 2,
		'75': quartile * 3,
	};
	(Object.keys(playbackEvents) as Array<keyof PlaybackEvents>).forEach(
		(key) => {
			const value = playbackEvents[key];

			if (
				!EVENTSFIRED.includes(key) &&
				youtubePlayer.getCurrentTime() > value
			) {
				trackYoutubeEvent(key, atomId);
				EVENTSFIRED.push(key);
				mediator.emit(key);
			}
		},
	);
};

export const initHostedYoutube = async (el: HTMLElement): Promise<void> => {
	// dataset is slower for a single attribute
	// https://jsbench.me/5wku5obaj4/1
	// @MarSavar (2021-09-29)
	const atomId = el.getAttribute('data-media-id');
	const duration = Number(el.getAttribute('data-duration')) || null;

	if (!atomId || !duration) {
		return;
	}

	const youtubeTimer = document.getElementsByClassName(
		'js-youtube-current-time',
	)[0];
	let playTimer: number | undefined;
	initYoutubeEvents(atomId);

	return initYoutubePlayer(
		el,
		{
			onPlayerReady: () => {
				// Do nothing
			},
			onPlayerStateChange(event) {
				const player = event.target;

				// show end slate when movie finishes
				if (Number(event.data) === window.YT.PlayerState.ENDED) {
					trackYoutubeEvent('end', atomId);
					youtubeTimer.textContent = '0:00';
				} else {
					// update current time
					const currentTime = Math.floor(player.getCurrentTime());
					const seconds = currentTime % 60;
					const minutes = (currentTime - seconds) / 60;
					youtubeTimer.textContent =
						String(minutes) +
						(seconds < 10 ? ':0' : ':') +
						String(seconds);
				}

				if (Number(event.data) === window.YT.PlayerState.PLAYING) {
					trackYoutubeEvent('play', atomId);
					const playerTotalTime = player.getDuration();
					playTimer = window.setInterval(() => {
						sendPercentageCompleteEvents(
							atomId,
							player,
							playerTotalTime,
						);
					}, 1000);
				} else {
					window.clearInterval(playTimer);
				}
			},
		},
		String(el.getAttribute('data-asset-id')),
	).then(() => void 0);
};
