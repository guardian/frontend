import type { ABTest } from '@guardian/ab-core';

export const mobileDiscussionAds: ABTest = {
	id: 'MobileDiscussionAds',
	author: '@commercial-dev',
	start: '2024-02-05',
	expiry: '2024-03-05',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: '',
	successMeasure: '',
	description: 'Test ads in discussion for mobile',
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
