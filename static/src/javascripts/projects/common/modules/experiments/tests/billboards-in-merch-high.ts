import type { ABTest } from '@guardian/ab-core';

export const billboardsInMerchHigh: ABTest = {
	id: 'BillboardsInMerchHigh',
	author: '@commercial-dev',
	start: '2022-12-07',
	expiry: '2023-11-30',
	// TODO increase audience size and set offset once we know desired sample size
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'Opt in only',
	successMeasure:
		'Test the commercial impact of showing billboard adverts in merchandising-high slots',
	description:
		'Show billboard adverts in merchandising-high slots to browsers in the variant',
	variants: [
		{
			id: 'control',
			test: (): void => {
				/* */
			},
		},
		{
			id: 'variant',
			test: (): void => {
				/* */
			},
		},
	],
	canRun: () => true,
};
