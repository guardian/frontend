import type { ABTest } from '@guardian/ab-core';

export const prebidKargo: ABTest = {
	id: 'PrebidKargo',
	author: '@commercial-dev',
	start: '2023-12-05',
	expiry: '2024-02-29',
	audience: 2 / 100,
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
