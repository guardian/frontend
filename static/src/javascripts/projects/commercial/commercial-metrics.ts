import {
	bypassCommercialMetricsSampling,
	initCommercialMetrics,
} from '@guardian/commercial-core';
import { shouldCaptureMetrics } from '../common/modules/analytics/shouldCaptureMetrics';

const { isDev } = window.guardian.config.page;
const { pageViewId } = window.guardian.ophan;
const { browserId } = window.guardian.config.ophan;
const { adBlockers } = window.guardian;

let logged = false;
const initMetrics = (): void => {
	if (logged) return;
	const args: [string, string | undefined, boolean, boolean?] =
		adBlockers.active === undefined
			? [pageViewId, browserId, isDev]
			: [pageViewId, browserId, isDev, adBlockers.active];

	logged = initCommercialMetrics(...args);
};

const init = (): Promise<void> => {
	if (!window.guardian.config.switches.commercialMetrics) {
		return Promise.resolve();
	}

	initMetrics();

	if (shouldCaptureMetrics()) {
		bypassCommercialMetricsSampling();
	}

	return Promise.resolve();
};

/**
 * A way to override the metrics sampling.
 * It is safe to call this method repeatedly, as per [the `EventListener` docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#multiple_identical_event_listeners)
 */
const captureCommercialMetrics = (): void => {
	bypassCommercialMetricsSampling();
};

export { init, captureCommercialMetrics };
