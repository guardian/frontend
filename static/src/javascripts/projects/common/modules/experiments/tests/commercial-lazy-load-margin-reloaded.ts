import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const commercialLazyLoadMarginReloaded: ABTest = {
	id: 'CommercialLazyLoadMarginReloaded',
	start: '2022-06-20',
	expiry: '2022-07-04',
	author: 'Simon Byford',
	description:
		'Once again test various margins at which ads are lazily-loaded in order to find the optimal one, this time using values between 0% and 70% of the viewport height',
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
			id: 'variant-1',
			test: noop,
		},
		{
			id: 'variant-2',
			test: noop,
		},
		{
			id: 'variant-3',
			test: noop,
		},
		{
			id: 'variant-4',
			test: noop,
		},
		{
			id: 'variant-5',
			test: noop,
		},
		{
			id: 'variant-6',
			test: noop,
		},
		{
			id: 'variant-7',
			test: noop,
		},
		{
			id: 'variant-8',
			test: noop,
		},
	],
};
