import type { ABTest } from '@guardian/ab-core';

export const prebidMagnite: ABTest = {
	id: 'PrebidMagnite',
	author: '@commercial-dev',
	start: '2024-07-18',
	expiry: '2024-09-30',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: '',
	successMeasure: '',
	description: 'Test Magnite as a prebid bidder.',
	variants: [
		{
			id: 'control',
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'variant',
			test: (): void => {
				/* no-op */
			},
		},
	],
	canRun: () => true,
};
