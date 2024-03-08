import type { ABTest } from '@guardian/ab-core';

export const sectionAdDensity: ABTest = {
	id: 'SectionAdDensity',
	author: '@commercial-dev',
	start: '2024-03-07',
	expiry: '2024-07-26',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria:
		'Article pages in the following sections: business, environment, music, money, artanddesign, science, stage, travel, wellness, games',
	successMeasure:
		'Overall revenue increases without harming attention time and page views per session metrics.',
	description:
		'Increase inline advert density on article pages in high value sections.',
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
	canRun: () => true,
};
