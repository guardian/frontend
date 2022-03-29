import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const commercialLazyLoadMargin: ABTest = {
	id: 'CommercialLazyLoadMargin',
	start: '2022-03-29',
	// test should be in place for a minimum of 16 days
	expiry: '2022-04-19',
	author: 'Zeke Hunter-Green',
	description:
		'Test various margins at which ads are lazily-loaded in order to find the optimal one',
	audience: 10 / 100,
	audienceOffset: 10 / 100,
	successMeasure: 'Ad ratio, viewability, and CLS remain constant or improve',
	audienceCriteria: 'n/a',
	dataLinkNames: 'n/a',
	idealOutcome:
		'One of the variants shows a marked improvement in all of the metrics that we are considering',
	canRun: () => true,
	variants: [
		{
			id: 'control',
			test: noop,
		},
		{
			id: 'variant 1',
			test: noop,
		},
		{
			id: 'variant 2',
			test: noop,
		},
		{
			id: 'variant 3',
			test: noop,
		},
		{
			id: 'variant 4',
			test: noop,
		},
		{
			id: 'variant 5',
			test: noop,
		},
		{
			id: 'variant 6',
			test: noop,
		},
		{
			id: 'variant 7',
			test: noop,
		},
		{
			id: 'variant 8',
			test: noop,
		},
	],
};
