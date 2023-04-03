import type { ABTest } from '@guardian/ab-core';
import { bypassMetricsSampling } from '../utils';

export const eagerPrebid: ABTest = {
	id: 'EagerPrebid',
	author: '@commercial-dev',
	start: '2023-03-23',
	expiry: '2023-05-01',
	audience: 5 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'All pageviews',
	successMeasure:
		'Ads lazy load faster, without affecting the page load time',
	description: 'Test the impact of running prebid on page load',
	variants: [
		{ id: 'control', test: bypassMetricsSampling },
		{ id: 'variant-20', test: bypassMetricsSampling },
		{ id: 'variant-17', test: bypassMetricsSampling },
		{ id: 'variant-15', test: bypassMetricsSampling },
		{ id: 'variant-12', test: bypassMetricsSampling },
		{ id: 'variant-10', test: bypassMetricsSampling },
	],
	canRun: () => true,
};
