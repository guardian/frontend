import { loadScript } from '@guardian/libs';
import { buildPageParameters } from './build-page-parameters';

function initConsentless(): Promise<void> {
	// Stub the command queue
	// @ts-expect-error -- it’s a stub, not the whole OO tag object
	window.ootag = {
		queue: [],
	};
	window.ootag.queue.push(function () {
		window.ootag.initializeOo({
			publisher: 33,
			noLogging: 0,
			// consentTimeOutMS: 5000,
			onlyNoConsent: 1,
		});
		window.ootag.addParameter('test', 'yes');

		Object.entries(buildPageParameters()).forEach(([key, value]) => {
			if (!value) {
				return;
			}
			window.ootag.addParameter(key, value);
		});
	});

	// TODO this seems to be safeframeless version. Ask OptOut how we can use safeframes.
	void loadScript('//cdn.optoutadvertising.com/script/ootag.min.js');
	return Promise.resolve();
}

export { initConsentless };
