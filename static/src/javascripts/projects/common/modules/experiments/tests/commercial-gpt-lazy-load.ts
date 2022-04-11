import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const commercialGptLazyLoad: ABTest = {
	id: 'CommercialGptLazyLoad',
	start: '2022-03-29',
	// The test should run for ten days
	expiry: '2022-05-01',
	author: 'Zeke Hunter-Green',
	description:
		'This test compares GPT enableLazyLoad to our custom-built lazy load solution',
	audience: 5 / 100,
	audienceOffset: 20 / 100,
	successMeasure: 'Ad ratio and viewability remain constant or improve',
	audienceCriteria: 'n/a',
	dataLinkNames: 'n/a',
	idealOutcome:
		'GPT enableLazyLoad outperforms our custom built lazy load solution',
	canRun: () => true,
	variants: [
		{
			id: 'control',
			test: noop,
		},
		{
			id: 'variant',
			test: noop,
		},
	],
};
