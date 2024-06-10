import type { ABTest } from '@guardian/ab-core';

export const deeplyReadRightColumn: ABTest = {
	id: 'DeeplyReadRightColumn',
	author: '@dotcom-platform',
	start: '2024-05-01',
	expiry: '2024-07-31',
	audience: 15 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: '',
	successMeasure: 'Improved click though rate',
	description:
		'Test the impact of adding deeply read component to the right column.',
	variants: [
		{
			id: 'most-viewed-only',
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'deeply-read-and-most-viewed',
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
