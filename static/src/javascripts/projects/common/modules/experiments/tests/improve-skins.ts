import type { ABTest } from '@guardian/ab-core';

export const improveSkins: ABTest = {
	id: 'ImproveSkins',
	start: '2021-07-09',
	expiry: '2021-08-17',
	author: 'Max Duval (@mxdvl) / @guardian/commercial-dev',
	description: 'Serve Improve page skins via Prebid and measure performance',
	audience: 1 / 100,
	audienceOffset: 0.25,
	successMeasure:
		'no significant impact on ad speed performance and core web vitals',
	audienceCriteria: 'n/a',
	showForSensitive: true,
	variants: [
		{
			id: 'control',
			test: (): void => {
				// do nothing
			},
		},
		{
			id: 'variant',
			test: (): void => {
				// do nothing
			},
		},
	],
	canRun: () => true,
};
