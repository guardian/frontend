import type { ABTest } from '@guardian/ab-core';

export const stickyLiveBlogAskTest: ABTest = {
	id: 'StickyLiveBlogAskTest',
	author: '@growth',
	start: '2024-07-01',
	expiry: '2024-07-31',
	audience: 1,
	audienceOffset: 0,
	audienceCriteria: 'everyone',
	successMeasure: 'There is more revenue generated when this is on the page',
	description:
		'Test that revenue is generated from this ask than when there is only an epic on a pageview.',
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
