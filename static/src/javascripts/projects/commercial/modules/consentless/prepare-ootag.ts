import { loadScript } from '@guardian/libs';

function initConsentless(): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- This isn't defined yet
	window.ootag = window.ootag || {};
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- This isn't defined yet
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

	// TODO this seems to be safeframeless version. Ask OptOut how we can use safeframes.
	void loadScript('//cdn.optoutadvertising.com/script/ootag.min.js');
	return Promise.resolve();
}

export { initConsentless };
