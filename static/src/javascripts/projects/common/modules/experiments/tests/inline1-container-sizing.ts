import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const inline1ContainerSizing: ABTest = {
	id: 'Inline1ContainerSizing',
	start: '2022-04-26',
	expiry: '2022-05-24',
	author: 'arelra',
	description:
		'Tests the impact on CLS of fixing the inline1 ad container to full width',
	audience: 20 / 100,
	audienceOffset: 30 / 100,
	successMeasure: 'Reduced CLS',
	audienceCriteria: 'n/a',
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
