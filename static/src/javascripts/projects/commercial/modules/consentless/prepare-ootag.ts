import { buildPageTargetingConsentless } from '@guardian/commercial/core';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { loadScript } from '@guardian/libs';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

function initConsentless(consentState: ConsentState): Promise<void> {
	return new Promise((resolve) => {
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
				noRequestsOnPageLoad: 1,
			});

			Object.entries(
				buildPageTargetingConsentless(
					consentState,
					commercialFeatures.adFree,
				),
			).forEach(([key, value]) => {
				if (!value) {
					return;
				}
				window.ootag.addParameter(key, value);
			});
			resolve();
		});

		void loadScript(
			'//cdn.optoutadvertising.com/script/ooguardian.v4.min.js',
		);
	});
}

export { initConsentless };
