import { sendCommercialMetrics } from '@guardian/commercial-core';
import config_ from '../../lib/config';

// This is really a hacky workaround ⚠️
// TODO convert config.js to TypeScript
const config = config_ as {
	get: (s: string, d?: unknown) => unknown;
};

let logged = false;

const isDev = Boolean(config.get('page.isDev', false));

const init = (): void => {
	if (!window.guardian.ophan) return;
	if (!config.get('switches.commercialMetrics', false)) return;

	const userIsInSamplingGroup = Math.random() <= 0.01;
	const pageViewId = window.guardian.ophan.pageViewId;
	const browserId = config.get('ophan.browserId') as string | undefined;

	if (isDev || userIsInSamplingGroup) {
		document.addEventListener('visibilitychange', function () {
			if (logged) return;
			logged = sendCommercialMetrics(pageViewId, browserId, isDev);
		});
	}
};

export { init };
