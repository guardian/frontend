import fastdom from 'fastdom';
import { amIUsed } from '../../../commercial/sentinel';
import { trackNonClickInteraction } from '../../../common/modules/analytics/google';
import { load } from './next-video';

let nextVideoInterval: NodeJS.Timeout;
let $hostedNext: HTMLElement | null;
let $timer: HTMLElement | null;
let nextVideoPage: string | undefined;

const cancelAutoplay = () => {
	amIUsed('next-video-autoplay', 'cancelAutoplay');
	fastdom.mutate(() => {
		$hostedNext?.classList.add('hosted-slide-out');
	});
	clearInterval(nextVideoInterval);
};

const cancelAutoplayMobile = () => {
	amIUsed('next-video-autoplay', 'cancelAutoplayMobile');
	fastdom.mutate(() => {
		$hostedNext?.classList.add('u-h');
	});
};

const triggerAutoplay = (
	getCurrentTimeFn: () => number,
	duration: number,
): void => {
	amIUsed('next-video-autoplay', 'triggerAutoplay');
	nextVideoInterval = setInterval(() => {
		const timeLeft = duration - Math.ceil(getCurrentTimeFn());
		const countdownLength = 10; // seconds before the end when to show the timer

		if (timeLeft <= countdownLength) {
			fastdom.mutate(() => {
				$hostedNext?.classList.add('js-autoplay-start');
				if ($timer) $timer.textContent = `${timeLeft}s`;
			});
		}
		if (timeLeft <= 0) {
			trackNonClickInteraction('Immediately play the next video');
			if (nextVideoPage) window.location.href = nextVideoPage;
		}
	}, 1000);
};

const triggerEndSlate = (): void => {
	amIUsed('next-video-autoplay', 'triggerEndSlate');
	fastdom.mutate(() => {
		$hostedNext?.classList.add('js-autoplay-start');
	});

	const element = document.querySelector('.js-autoplay-cancel');
	element?.addEventListener('click', () => {
		cancelAutoplayMobile();
	});
};

const addCancelListener = (): void => {
	amIUsed('next-video-autoplay', 'addCancelListener');
	const element = document.querySelector('.js-autoplay-cancel');
	element?.addEventListener('click', () => {
		cancelAutoplay();
	});
};

const canAutoplay = (): boolean => {
	amIUsed('next-video-autoplay', 'canAutoplay');
	return !!($hostedNext && nextVideoPage);
};

/*
    This module appears to setup autoplay for guardian-hosted commercial videos (i.e. not Youtube) - couldn't find any examples of this
*/

const init = (): Promise<void> => {
	amIUsed('next-video-autoplay', 'init');
	return load().then(() => {
		$hostedNext = document.querySelector('.js-hosted-next-autoplay');
		$timer = document.querySelector('.js-autoplay-timer');
		nextVideoPage = $timer?.dataset.nextPage;
	});
};
export {
	init,
	canAutoplay,
	triggerEndSlate,
	triggerAutoplay,
	addCancelListener,
};
