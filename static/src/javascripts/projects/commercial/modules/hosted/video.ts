import { initHostedYoutube } from 'commercial/modules/hosted/youtube';

export const initHostedVideo = (): Promise<void> => {
	const youtubeIframe: NodeListOf<HTMLElement> = document.querySelectorAll(
		'.js-hosted-youtube-video',
	);

	if (!youtubeIframe.length) {
		// Halt execution if there are no video containers on the page.
		return Promise.resolve();
	}

	void new Promise(() => {
		Array.from(youtubeIframe).forEach(initHostedYoutube);
	});
	return Promise.resolve();
};
