import { ABTest } from "@guardian/ab-core";

export const commercialPartner: ABTest = {
	id: 'CommercialPartner',
	start: '2021-06-21',
	expiry: '2021-09-01',
	author: 'mxdvl',
	description: 'Some fake test for functionality',
	audience: 0,
	audienceOffset: 0,
	successMeasure: 'n/a',
	audienceCriteria: 'n/a',
	showForSensitive: true,
	commercialMetrics: true,
	variants: [
		{
			id: 'force-commercial-metrics',
			test: (): void => {
				// debugger;
			},
		},
		{
			id: 'control',
			test: (): void => {
				// do nothing;
			},
		},
	],
	canRun: () => true,
};
