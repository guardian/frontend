import type { ABTest } from '@guardian/ab-core';

export const onwardJourneys: ABTest = {
	id: 'OnwardJourneys',
	start: '2024-05-09',
	expiry: '2024-05-16',
	author: '@web-experience',
	description:
		'Show the user one onward journey containers at a time to see which is the most effective',
	audience: 100 / 100,
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
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'top-row-most-viewed',
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'bottom-row-most-viewed',
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'most-viewed-only',
			test: (): void => {
				/* no-op */
			},
		},
	],
	successMeasure: '',
};
