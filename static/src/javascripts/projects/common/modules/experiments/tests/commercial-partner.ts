import { forceUserInABTest } from 'commercial/commercial-metrics';

export const commercialPartner: ABTest = {
	id: 'commercial-partner',
	start: '2021-06-21',
	expiry: '2021-07-01',
	author: 'mxdvl',
	description: 'Some fake test for functionality',
	audience: 0,
	audienceOffset: 0,
	successMeasure: 'n/a',
	audienceCriteria: 'n/a',
	showForSensitive: true,
	variants: [
		{
			id: 'variant',
			test: (): void => {
				forceUserInABTest();
			},
		},
	],
	canRun: () => true,
};
