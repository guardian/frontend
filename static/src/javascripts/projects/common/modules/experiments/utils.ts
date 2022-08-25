import { bypassCommercialMetricsSampling } from '@guardian/commercial-core';
import { bypassCoreWebVitalsSampling } from '@guardian/libs';

export const bypassMetricsSampling = (): void => {
	void bypassCommercialMetricsSampling();
	void bypassCoreWebVitalsSampling();
};
