import type { ABTest } from '@guardian/ab-core';

export const blockSupporterRevenueMessagingSport: ABTest = {
	id: 'BlockSupporterRevenueMessagingSport',
	author: '@commercial-dev',
	start: '2024-03-14',
	expiry: '2024-06-01',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'Fronts and articles in the Sport section',
	successMeasure:
		'Ad revenue and ad ration increases without significantly impacting supporter revenue',
	description: 'Block supporter revenue messaging in the Sport section',
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
	canRun: () =>
		window.guardian.config.page.section === 'sport' ||
		window.guardian.config.page.section === 'football',
};
