import type { ABTest } from '@guardian/ab-core';

// Audience set to zero while setting up
export const updatedHeaderDesign: ABTest = {
	id: 'UpdatedHeaderDesign',
	author: '@cemms1',
	start: '2024-04-29', // Update when setting the test live
	expiry: '2024-05-02', // Update when setting the test live
	audience: 0 / 100, // Update when setting the test live
	audienceOffset: 0 / 100, // Update when setting the test live
	audienceCriteria: 'All pages using the Header and/or Nav components',
	successMeasure:
		'Ad revenue and supporter revenue not affected by new Header and Nav designs',
	description: 'Show updated design of Header, with Nav included',
	variants: [
		{
			id: 'control',
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'variant',
			test: (): void => {
				/* no-op */
			},
		},
	],
	canRun: () => window.guardian.config.isDotcomRendering,
};
