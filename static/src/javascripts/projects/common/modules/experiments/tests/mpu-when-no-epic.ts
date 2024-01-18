import type { ABTest } from '@guardian/ab-core';

export const mpuWhenNoEpic: ABTest = {
	id: 'MpuWhenNoEpic',
	author: '@commercial-dev',
	start: '2023-11-22',
	expiry: '2024-01-31',
	audience: 10 / 100,
	audienceOffset: 5 / 100,
	audienceCriteria: '',
	successMeasure: '',
	description:
		'Test MPU when there is no epic at the end of Article on the page.',
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
