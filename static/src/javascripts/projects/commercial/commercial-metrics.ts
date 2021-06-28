import { sendCommercialMetrics } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { getSynchronousTestsToRun } from 'common/modules/experiments/ab';
import config_ from '../../lib/config';

// This is really a hacky workaround ⚠️
// TODO convert config.js to TypeScript
const config = config_ as {
	get: (s: string, d?: unknown) => unknown;
};

let logged = false;

const isDev = Boolean(config.get('page.isDev', false));

const init = (): Promise<void> => {
	if (!window.guardian.ophan) return Promise.resolve();
	if (!config.get('switches.commercialMetrics', false))
		return Promise.resolve();

	const userIsInSamplingGroup = Math.random() <= 0.01;
	const shouldForceMetrics = getSynchronousTestsToRun().some(
		(test) => test.commercialMetrics,
	);
	const pageViewId = window.guardian.ophan.pageViewId;
	const browserId = config.get('ophan.browserId') as string | undefined;

	log('commercial', 'getSynchronousTestsToRun', getSynchronousTestsToRun());

	if (isDev || shouldForceMetrics || userIsInSamplingGroup) {
		log('commercial', { isDev, shouldForceMetrics, userIsInSamplingGroup });
		document.addEventListener('visibilitychange', function () {
			if (logged) return;
			logged = sendCommercialMetrics(pageViewId, browserId, isDev);
		});
	}

	return Promise.resolve();
};

export { init };
