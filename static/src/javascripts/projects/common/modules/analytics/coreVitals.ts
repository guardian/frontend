import {
	bypassCoreWebVitalsSampling,
	getCookie,
	initCoreWebVitals,
} from '@guardian/libs';
import { shouldCaptureMetrics } from './shouldCaptureMetrics';

const coreVitals = (): void => {
	const browserId = getCookie({ name: 'bwid', shouldMemoize: true });
	const pageViewId = window.guardian.config.ophan.pageViewId;
	const { isDev } = window.guardian.config.page;
	const sampling = 1 / 100;

	/* eslint-disable @typescript-eslint/no-floating-promises -- they’re async methods */
	initCoreWebVitals({
		browserId,
		pageViewId,
		isDev,
		sampling,
		team: 'dotcom',
	});

	if (shouldCaptureMetrics()) bypassCoreWebVitalsSampling('commercial');
	/* eslint-enable @typescript-eslint/no-floating-promises -- they’re async methods */
};

export { coreVitals };
