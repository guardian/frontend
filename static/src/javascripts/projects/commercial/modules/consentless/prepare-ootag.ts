/* eslint-disable @typescript-eslint/no-unnecessary-condition -- ...????*/
import { loadScript } from '@guardian/libs';

function init(): Promise<void> {
	window.ootag = window.ootag || {};
	window.ootag.queue = window.ootag.queue || [];
	window.ootag.queue.push(function () {
		window.ootag.initializeOo({
			publisher: 33,
			noLogging: 0,
			// consentTimeOutMS: 5000,
			onlyNoConsent: 1,
		});
		window.ootag.addParameter('test', 'yes');
	});

	window.ootag.queue.push(function () {
		window.ootag.defineSlot({
			adSlot: 'homepage-lead',
			targetId: 'dfp-ad--top-above-nav',
			filledCallback: () => {
				console.log('filled top-above-nav');
			},
			emptyCallback: () => {
				console.log('empty top-above-nav');
			},
		});
	});

	// TODO this seems to be safeframeless version. Ask OptOut how we can use safeframes.
	void loadScript('//cdn.optoutadvertising.com/script/ootag.min.js', {
		async: false,
	});
	return Promise.resolve();
}

export { init };
