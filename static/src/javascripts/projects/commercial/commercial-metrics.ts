import {
	initCommercialMetrics,
	bypassCommercialMetricsSampling as switchOffSampling,
} from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { shouldCaptureMetrics } from '../common/modules/analytics/shouldCaptureMetrics';

const { isDev } = window.guardian.config.page;
const { pageViewId } = window.guardian.ophan;
const { browserId } = window.guardian.config.ophan;
const { adBlockers } = window.guardian;

const init = (): Promise<void> => {
	if (!window.guardian.config.switches.commercialMetrics) {
		return Promise.resolve();
	}

	const args =
		adBlockers.active === undefined
			? { pageViewId, browserId, isDev }
			: {
					pageViewId,
					browserId,
					isDev,
					adBlockerInUse: adBlockers.active,
			  };

	initCommercialMetrics(args)
		.then(() => {
			if (shouldCaptureMetrics()) {
				// TODO: rename upstream
				void switchOffSampling();
			}
		})
		.catch((error) =>
			log('commercial', 'Error initialising commercial metrics', error),
		);

	return Promise.resolve();
};

export { init };
