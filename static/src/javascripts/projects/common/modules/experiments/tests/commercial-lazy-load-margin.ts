import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const commercialLazyLoadMargin: ABTest = {
	id: 'CommercialLazyLoadMargin',
	start: '2022-03-17',
	// test should be in place for a minimum of 14 days
	expiry: '2020-04-01',
	author: 'Zeke Hunter-Green',
	description:
		'Test various margins at which ads are lazily-loaded in order to find the optimal one',
	audience: 5 / 100,
	audienceOffset: 11 / 100,
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
			id: 'variant',
			test: noop,
		},
	],
};
