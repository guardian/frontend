import type { ABTest } from '@guardian/ab-core';

export const commercialPartner: ABTest = {
	id: 'CommercialPartner',
	start: '2021-06-21',
	expiry: '2021-09-01',
	author: 'Max Duval (@mxdvl)',
	description: 'Empty commercial partner test for subsequent use',
	audience: 0,
	audienceOffset: 0,
	successMeasure: 'n/a',
	audienceCriteria: 'n/a',
	showForSensitive: true,
	variants: [
		{
			id: 'variant',
			test: (): void => {
				// debugger;
			},
		},
	],
	canRun: () => true,
};
