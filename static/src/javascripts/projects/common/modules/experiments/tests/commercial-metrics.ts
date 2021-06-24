import type { ABTest } from '@guardian/ab-core';
import { forceCommercialMetricsForVariant } from 'commercial/commercial-metrics';

export const forceCommercialMetrics: ABTest = {
	id: 'ForceCommercialMetrics',
	start: '2021-06-24',
	expiry: '2021-09-01',
	description: 'Force all',
	author: 'Max Duval (Commercial Dev)',
	audience: 0,
	audienceOffset: 0,
	audienceCriteria: 'n/a',
	successMeasure: 'n/a',
	canRun: () => true,
	variants: [
		{
			id: 'variant',
			test: (): void => {
				forceCommercialMetricsForVariant();
			},
		},
	],
};
