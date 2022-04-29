import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const ipsosMoriAustralia: ABTest = {
	id: 'IpsosMoriAustralia',
	start: '2022-04-28',
	expiry: '2022-06-30',
	author: 'Lucy Monie Hall (@lucymonie)',
	description:
		'Provide a 0% AB test to check that tagging is working in the AU region',
	audience: 0,
	audienceOffset: 0,
	successMeasure: 'n/a',
	audienceCriteria: 'n/a',
	canRun: () => true,
	variants: [
		{
			id: 'variant',
			test: noop,
		},
	],
};
