import type { ABTest } from '@guardian/ab-core';

export const deeplyReadRightColumn: ABTest = {
	id: 'DeeplyReadRightColumn',
	author: '@dotcom-platform',
	start: '2024-05-01',
	expiry: '2024-07-31',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: '',
	successMeasure: 'Improved CTR',
	description:
		'Test the impact of adding deeply read component to the right column.',
	variants: [
		{
			id: 'control',
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'deeply-read-and-most-read',
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'deeply-read-only',
			test: (): void => {
				/* no-op */
			},
		},
	],
	canRun: () => true,
};
