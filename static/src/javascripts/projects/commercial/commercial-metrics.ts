import type { ABTest } from '@guardian/ab-core';
import { sendCommercialMetrics } from '@guardian/commercial-core';
import { getSynchronousTestsToRun } from 'common/modules/experiments/ab';
import { commercialPartner } from 'common/modules/experiments/tests/commercial-partner';
import { improveSkins } from 'common/modules/experiments/tests/improve-skins';
import config_ from '../../lib/config';

// This is really a hacky workaround ⚠️
// TODO convert config.js to TypeScript
const config = config_ as {
	get: (s: string, d?: unknown) => unknown;
};

const isDev = Boolean(config.get('page.isDev', false));
const { pageViewId } = window.guardian.ophan;
const { browserId } = window.guardian.config.ophan;

let logged = false;
const sendMetrics = (): void => {
	if (logged) return;
	logged = sendCommercialMetrics(pageViewId, browserId, isDev);
};

const init = (): Promise<void> => {
	if (!config.get('switches.commercialMetrics', false))
		return Promise.resolve();

	const testsToForceMetricsFor: ABTest[] = [commercialPartner, improveSkins];

	const userIsInSamplingGroup = Math.random() <= 0.01;
	const shouldForceMetrics = getSynchronousTestsToRun().some((test) =>
		testsToForceMetricsFor.map((t) => t.id).includes(test.id),
	);

	if (isDev || shouldForceMetrics || userIsInSamplingGroup) {
		document.addEventListener('visibilitychange', sendMetrics);
	}

	return Promise.resolve();
};

/**
 * A way to override the metrics sampling.
 * It is safe to call this method repeatedly, as per [the `EventListener` docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#multiple_identical_event_listeners)
 */
const captureCommercialMetrics = (): void => {
	document.addEventListener('visibilitychange', sendMetrics);
};

export { init, captureCommercialMetrics };
