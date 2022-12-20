import type { ABTest } from '@guardian/ab-core';
import { bypassMetricsSampling } from '../utils';

export const noCarrotAdsNearNewsletterSignupBlocks: ABTest = {
	id: 'NoCarrotAdsNearNewsletterSignupBlocks',
	author: '@commercial-dev',
	start: '2022-12-08',
	expiry: '2023-02-01',
	audience: 10 / 100,
	audienceOffset: 35 / 100,
	audienceCriteria: 'All pageviews',
	successMeasure:
		'Making the change does not lead to a significant reduction in inline programmatic revenue per 1000 pageviews',
	description:
		'Test the impact of preventing spacefinder from positioning carrot ads near newsletter signup blocks',
	variants: [
		{ id: 'control', test: bypassMetricsSampling() },
		{ id: 'variant', test: bypassMetricsSampling() },
	],
	canRun: () => true,
};
