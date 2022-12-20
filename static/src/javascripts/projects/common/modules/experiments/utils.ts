import { bypassCommercialMetricsSampling } from '@guardian/commercial-core';
import { bypassCoreWebVitalsSampling } from '@guardian/core-web-vitals';

export const bypassMetricsSampling = (): void => {
	void bypassCommercialMetricsSampling();
	void bypassCoreWebVitalsSampling();
};
