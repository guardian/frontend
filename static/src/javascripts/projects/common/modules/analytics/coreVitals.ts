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

	initCoreWebVitals({
		browserId,
		pageViewId,
		isDev,
		sampling,
		team: 'dotcom',
	});

	if (shouldCaptureMetrics()) bypassCoreWebVitalsSampling('commercial');
};

export { coreVitals };
