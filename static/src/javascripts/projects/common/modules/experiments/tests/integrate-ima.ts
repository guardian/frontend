import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const integrateIma: ABTest = {
	id: 'IntegrateIma',
	start: '2022-07-14',
	expiry: '2022-12-30',
	author: 'Zeke Hunter-Green',
	description:
		'Test the commercial impact of replacing YouTube ads with Interactive Media Ads on first-party videos',
	audience: 5 / 100,
	audienceOffset: 30 / 100,
	audienceCriteria: 'Opt in',
	successMeasure:
		'IMA integration works as expected without adversely affecting pages with videos',
	canRun: () => true,
	variants: [
		{
			id: 'variant',
			test: () => noop,
		},
	],
};
