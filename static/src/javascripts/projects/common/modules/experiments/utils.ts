import { bypassCommercialMetricsSampling } from '@guardian/commercial-core';
import { bypassCoreWebVitalsSampling } from '@guardian/libs';

export const bypassMetricsSampling = (): void => {
	console.log('overriding commercial sampling');
	void bypassCommercialMetricsSampling();

	console.log('overriding CWV sampling');
	bypassCoreWebVitalsSampling();
};
