import type { ABTest } from '@guardian/ab-core';
import { bypassMetricsSampling } from '../utils';

export const liveblogDesktopOutstream: ABTest = {
	id: 'LiveblogDesktopOutstream',
	start: '2022-12-02',
	expiry: '2023-01-31',
	author: 'Jake Lee Kennedy',
	description:
		'Test the impact of enabling outstream on inline2+ on liveblogs on desktop',
	audience: 5 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'Opt in',
	successMeasure: 'No significant impact to CWV',
	canRun: () => true,
	variants: [
		{ id: 'control', test: () => bypassMetricsSampling() },
		{ id: 'variant', test: () => bypassMetricsSampling() },
	],
};
