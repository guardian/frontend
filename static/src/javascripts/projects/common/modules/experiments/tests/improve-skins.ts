import type { ABTest } from '@guardian/ab-core';

export const improveSkins: ABTest = {
	id: 'ImproveSkins',
	start: '2021-07-09',
	expiry: '2021-08-09',
	author: 'Max Duval (@mxdvl)',
	description: 'Serve Improve page skins via Prebid and measure performance',
	audience: 0.002,
	audienceOffset: 0.25,
	successMeasure: 'no significant impact on ad speed performance',
	audienceCriteria: 'n/a',
	showForSensitive: true,
	variants: [
		{
			id: 'variant',
			test: (): void => {
				// do nothing
			},
		},
	],
	canRun: () => true,
};
