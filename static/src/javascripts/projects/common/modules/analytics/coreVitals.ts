import {
	bypassCoreWebVitalsSampling,
	getCookie,
	initCoreWebVitals,
} from '@guardian/libs';

const coreVitals = (): void => {
	const browserId = getCookie({ name: 'bwid', shouldMemoize: true });
	const pageViewId = window.guardian.config.ophan.pageViewId;
	const { isDev } = window.guardian.config.page;
	const sampling = 1 / 100;

	return initCoreWebVitals({
		browserId,
		pageViewId,
		isDev,
		sampling,
		team: 'dotcom',
	});
};

export { bypassCoreWebVitalsSampling, coreVitals };
