import type { ABTest } from '@guardian/ab-core';
import { bypassMetricsSampling } from '../utils';

export const eagerPrebid: ABTest = {
	id: 'EagerPrebid2',
	author: '@commercial-dev',
	start: '2023-09-26',
	expiry: '2023-10-31',
	audience: 1 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'All pageviews',
	successMeasure:
		'Ads lazy load faster, without affecting the page load time',
	description: 'Test the impact of running prebid lazily',
	variants: [
		{ id: 'control', test: bypassMetricsSampling },
		{ id: 'variant-1', test: bypassMetricsSampling },
		{ id: 'variant-2', test: bypassMetricsSampling },
	] as const,
	canRun: () => true,
};
