import type { ABTest } from '@guardian/ab-core';

export const oscarsNewsletterEmbed: ABTest = {
	id: 'OscarsNewsletterEmbed',
	author: '@commercial-dev',
	start: '2024-03-07',
	expiry: '2024-04-02',
	audience: 10 / 100,
	audienceOffset: 15 / 100,
	audienceCriteria: '',
	successMeasure: '',
	description: 'Will change the newsletter embed for Oscars articles.',
	variants: [
		{
			id: 'control',
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'variant-1',
			test: (): void => {
				/* no-op */
			},
		},
		{
			id: 'variant-2',
			test: (): void => {
				/* no-op */
			},
		},
	],
	canRun: () => true,
};
