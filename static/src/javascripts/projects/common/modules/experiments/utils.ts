import { bypassCommercialMetricsSampling } from '@guardian/commercial-core';
import { bypassCoreWebVitalsSampling } from '@guardian/libs';

export const bypassMetricsSampling = (): void => {
	void bypassCommercialMetricsSampling();
	/* eslint-disable-next-line @typescript-eslint/no-floating-promises -- this is an async method */
	bypassCoreWebVitalsSampling();
};
