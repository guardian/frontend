import type { ABTest } from '@guardian/ab-core';

// Audience set to zero while setting up
export const mastheadWithHighlights: ABTest = {
	id: 'MastheadWithHighlights',
	author: '@cemms1',
	start: '2024-06-03', // Update when setting the test live
	expiry: '2024-06-30', // Update when setting the test live
	audience: 0 / 100, // Update when setting the test live
	audienceOffset: 0 / 100, // Update when setting the test live
	audienceCriteria: 'Europe network front and Europe edition only',
	successMeasure:
		'Ad revenue and supporter revenue not affected by new masthead component, with highlights container',
	description: 'Show masthead component, with highlights container',
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
	// Test will only run on European front for EUR edition for DCR pages
	canRun: () =>
		window.guardian.config.isDotcomRendering &&
		window.location.pathname === '/europe' &&
		window.guardian.config.page.edition === 'EUR',
};
