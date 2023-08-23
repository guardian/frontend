import type { ABTest } from '@guardian/ab-core';

export const publicGoodTest: ABTest = {
	id: 'PublicGoodTest',
	author: '@commercial-dev',
	start: '2023-08-22',
	expiry: '2023-09-15',
	audience: 10 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'USA only',
	successMeasure: 'No significant impact to UX',
	description: 'Test public good messaging on articles',
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
