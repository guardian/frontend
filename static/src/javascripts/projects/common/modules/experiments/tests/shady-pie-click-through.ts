import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const shadyPieClickThrough: ABTest = {
	id: 'shadyPieClickThrough',
	start: '2022-09-23',
	expiry: '2022-12-30',
	author: 'Emma Imber',
	description:
		'Test the click through rate of the new labs shady pie component',
	audience: 0,
	audienceOffset: 0,
	audienceCriteria: 'Opt in',
	successMeasure:
		'Getting a statistically significant measure of the click through rate',
	canRun: () => true, //might be where I limit test based on ad blocker use
	variants: [
		{
			id: 'variant',
			test: () => noop,
		},
		{
			id: 'control',
			test: () => noop,
		},
	],
};
