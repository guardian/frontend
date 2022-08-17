import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const consentlessAds: ABTest = {
	id: 'ConsentlessAds',
	author: '@commercial-dev',
	start: '2022-08-11',
	expiry: '2023-06-01',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'All pageviews',
	successMeasure: 'Testing Opt Out ads in production',
	description: 'Use consentless ad stack rather than consented / standalone',
	variants: [
		{ id: 'control', test: noop },
		{ id: 'variant', test: noop },
	],
	canRun: () => true,
};
