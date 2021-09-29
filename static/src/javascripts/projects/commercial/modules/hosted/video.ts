import { initHostedYoutube } from 'commercial/modules/hosted/youtube';

export const initHostedVideo = async (): Promise<void> => {
	const playerContainers = document.querySelectorAll<HTMLElement>(
		'.js-hosted-youtube-video',
	);

	if (!playerContainers.length) {
		// Halt execution if there are no video containers on the page.
		return Promise.resolve();
	}

	await Promise.all(
		Array.from(playerContainers).map((el) => initHostedYoutube(el)),
	);

	return;
};
