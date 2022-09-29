import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { loadScript } from '@guardian/libs';
import { buildPageParameters } from './build-page-parameters';

function initConsentless(consentState: ConsentState): Promise<void> {
	// Stub the command queue
	// @ts-expect-error -- it’s a stub, not the whole OO tag object
	window.ootag = {
		queue: [],
	};
	window.ootag.queue.push(function () {
		window.ootag.initializeOo({
			publisher: 33,
			noLogging: 0,
			alwaysNoConsent: 1,
		});

		Object.entries(buildPageParameters(consentState)).forEach(
			([key, value]) => {
				if (!value) {
					return;
				}
				window.ootag.addParameter(key, value);
			},
		);
	});

	void loadScript('//cdn.optoutadvertising.com/script/ooguardian.v3.min.js');
	return Promise.resolve();
}

export { initConsentless };
