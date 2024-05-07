import type { ABTest } from '@guardian/ab-core';

export const onwardJourneys: ABTest = {
	id: 'OnwardJourneys',
	start: '2025-03-01', //  update once test is ready to go live
	expiry: '2025-12-01', //  update once test is ready to go live
	author: '@web-experience',
	description:
		'Show the user one onward journey containers at a time to see which is the most effective',
	audience: 25 / 100,
	audienceOffset: 0,
	audienceCriteria: 'all users',
	dataLinkNames: 'OnwardJourneys',
	idealOutcome:
		'Determine which combination of onward journey containers is the most effective',
	showForSensitive: true,
	canRun: () => true,
	variants: [
		{
			id: 'control',
			test: (): void => {},
		},
		{
			id: 'variant-1',
			test: (): void => {},
		},
		{
			id: 'variant-2',
			test: (): void => {},
		},
		{
			id: 'variant-3',
			test: (): void => {},
		},
	],
	successMeasure: '',
};
