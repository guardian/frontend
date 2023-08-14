import type { ABTest } from '@guardian/ab-core';

export const prebidKargo: ABTest = {
	id: 'PrebidKargo',
	author: '@commercial-dev',
	start: '2023-08-10',
	expiry: '2023-09-29',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'USA only',
	successMeasure: '',
	description: 'Test Kargo as a prebid bidder for US traffic',
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
