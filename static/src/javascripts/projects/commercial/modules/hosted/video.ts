import { initHostedYoutube } from 'commercial/modules/hosted/youtube';

export const initHostedVideo = (): Promise<void> => {
	const playerContainers = document.querySelectorAll<HTMLElement>(
		'.js-hosted-youtube-video',
	);

	if (!playerContainers.length) {
		// Halt execution if there are no video containers on the page.
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		playerContainers.forEach((el) => initHostedYoutube(el));
		resolve();
	});
};
