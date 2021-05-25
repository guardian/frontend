import fastdom from 'fastdom';
import { trackNonClickInteraction } from '../../../common/modules/analytics/google';
import { load } from './next-video';

let nextVideoInterval: NodeJS.Timeout;
let $hostedNext: HTMLElement | null;
let $timer: HTMLElement | null;
let nextVideoPage: string | undefined;

const cancelAutoplay = () => {
	fastdom.mutate(() => {
		$hostedNext?.classList.add('hosted-slide-out');
	});
	clearInterval(nextVideoInterval);
};

const cancelAutoplayMobile = () => {
	fastdom.mutate(() => {
		$hostedNext?.classList.add('u-h');
	});
};

const triggerAutoplay = (
	getCurrentTimeFn: () => number,
	duration: number,
): void => {
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
	fastdom.mutate(() => {
		$hostedNext?.classList.add('js-autoplay-start');
	});

	const element = document.querySelector('.js-autoplay-cancel');
	element?.addEventListener('click', () => {
		cancelAutoplayMobile();
	});
};

const addCancelListener = (): void => {
	const element = document.querySelector('.js-autoplay-cancel');
	element?.addEventListener('click', () => {
		cancelAutoplay();
	});
};

const canAutoplay = (): boolean => !!($hostedNext && nextVideoPage);

const init = (): Promise<void> =>
	load().then(() => {
		$hostedNext = document.querySelector('.js-hosted-next-autoplay');
		$timer = document.querySelector('.js-autoplay-timer');
		nextVideoPage = $timer?.dataset.nextPage;
	});

export {
	init,
	canAutoplay,
	triggerEndSlate,
	triggerAutoplay,
	addCancelListener,
};
