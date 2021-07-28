import type { ABTest } from '@guardian/ab-core';
import { sendCommercialMetrics } from '@guardian/commercial-core';
import { getSynchronousTestsToRun } from 'common/modules/experiments/ab';
import { commercialPartner } from 'common/modules/experiments/tests/commercial-partner';
import config_ from '../../lib/config';

// This is really a hacky workaround ⚠️
// TODO convert config.js to TypeScript
const config = config_ as {
	get: (s: string, d?: unknown) => unknown;
};

let logged = false;

const isDev = Boolean(config.get('page.isDev', false));

const init = (): Promise<void> => {
	if (!config.get('switches.commercialMetrics', false))
		return Promise.resolve();

	const testsToForceMetricsFor: ABTest[] = [commercialPartner];

	const userIsInSamplingGroup = Math.random() <= 0.01;
	const shouldForceMetrics = getSynchronousTestsToRun().some((test) =>
		testsToForceMetricsFor.map((t) => t.id).includes(test.id),
	);
	const pageViewId = window.guardian.ophan.pageViewId;
	const browserId = config.get('ophan.browserId') as string | undefined;

	if (isDev || shouldForceMetrics || userIsInSamplingGroup) {
		document.addEventListener('visibilitychange', function () {
			if (logged) return;
			logged = sendCommercialMetrics(pageViewId, browserId, isDev);
		});
	}

	return Promise.resolve();
};

export { init };
