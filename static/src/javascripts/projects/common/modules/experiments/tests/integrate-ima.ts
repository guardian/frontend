import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const integrateIma: ABTest = {
	id: 'IntegrateIma',
	start: '2022-07-14',
	expiry: '2024-02-28',
	author: 'Zeke Hunter-Green',
	description:
		'Test the commercial impact of replacing YouTube ads with Interactive Media Ads on first-party videos',
	// we might revisit this test so setting to zero for now
	audience: 0 / 100,
	audienceOffset: 10 / 100,
	audienceCriteria: 'Opt in',
	successMeasure:
		'IMA integration works as expected without adversely affecting pages with videos',
	canRun: () => true,
	variants: [
		{ id: 'control', test: () => noop },
		{ id: 'variant', test: () => noop },
	],
};
