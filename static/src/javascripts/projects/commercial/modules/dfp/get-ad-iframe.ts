/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

interface HTMLIFrameElementIE extends HTMLIFrameElement {
	readyState: string | undefined;
}

const getAdvertIframe = (adSlot: HTMLElement) =>
	new Promise((resolve, reject) => {
		// DFP will sometimes return empty iframes, denoted with a '__hidden__' parameter embedded in its ID.
		// We need to be sure only to select the ad content frame.
		const contentFrame = adSlot.querySelector<HTMLIFrameElement>(
			'iframe:not([id*="__hidden__"])',
		);

		if (!contentFrame) {
			reject();
		} else if (
			// Special handling for IE which has HTMLIFrameElement.readyState
			(contentFrame as HTMLIFrameElementIE).readyState &&
			(contentFrame as HTMLIFrameElementIE).readyState !== 'complete'
		) {
			// On IE, wait for the frame to load before interacting with it
			const getIeIframe = (e: Event) => {
				const updatedIFrame = e.srcElement as
					| HTMLIFrameElementIE
					| undefined;

				if (updatedIFrame && updatedIFrame.readyState === 'complete') {
					updatedIFrame.removeEventListener(
						'readystatechange',
						getIeIframe,
					);
					resolve(contentFrame);
				}
			};

			contentFrame.addEventListener('readystatechange', getIeIframe);
		} else {
			resolve(contentFrame);
		}
	});

const getAdIframe = (adSlot: HTMLElement): Promise<boolean> =>
	getAdvertIframe(adSlot)
		.then(() => true)
		.catch(() => false);

export { getAdIframe };
