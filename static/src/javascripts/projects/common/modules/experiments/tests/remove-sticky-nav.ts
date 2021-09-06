import type { ABTest } from '@guardian/ab-core';

export const removeStickyNav: ABTest = {
	id: 'RemoveStickyNav',
	start: '2021-09-10',
	expiry: '2021-10-10',
	author: 'Mario Savarese',
	description:
		'Remove the sticky behaviour of the navigation and subnavigation bars',
	audience: 0.01,
	audienceOffset: 0,
	successMeasure: 'Ad viewability score shows improvement.',
	audienceCriteria: 'DCR-rendered articles',
	showForSensitive: true,
	variants: [
		{
			id: 'variant',
			test: (): void => {
				// debug
			},
		},
	],
	canRun: () => true,
};
