import type { ABTest } from '@guardian/ab-core';

export const topAboveNavHeight: ABTest = {
	id: 'topAboveNavHeight',
	start: '2021-07-20',
	expiry: '2021-08-20',
	author: 'Zeke Hunter-Green (@zekehuntergreen)',
	description:
		'Set minimum height of top-above-nav ad slot to 250px rather than current height of 90px',
	audience: 0.01, // TODO verify
	audienceOffset: 0.25, // TODO verify
	successMeasure:
		'Higher engagement, improved core web vitals, no change to ad revenue',
	audienceCriteria: 'n/a',
	showForSensitive: true,
	variants: [
		{
			id: 'control',
			test: (): void => {
				// do nothing
			},
		},
		{
			id: 'variant',
			test: (): void => {
				// do nothing
			},
		},
	],
	canRun: () => true,
};
