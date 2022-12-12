import type { ABTest } from '@guardian/ab-core';
import { bypassMetricsSampling } from '../utils';

export const teadsCookieless: ABTest = {
	id: 'TeadsCookieless',
	start: '2022-12-07',
	expiry: '2023-12-31',
	author: 'Jake Lee Kennedy',
	description: 'Test the impact of enabling the Teads cookieless tag',
	audience: 0,
	audienceOffset: 5 / 100,
	audienceCriteria: 'Opt in',
	successMeasure: 'No significant impact to UX',
	canRun: () => true,
	variants: [
		{ id: 'control', test: () => bypassMetricsSampling },
		{ id: 'variant', test: () => bypassMetricsSampling },
	],
};
