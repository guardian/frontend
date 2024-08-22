import type { ABTest } from '@guardian/ab-core';

export const optimiseSpacefinderInline: ABTest = {
	id: 'OptimiseSpacefinderInline',
	author: '@commercial-dev',
	start: '2024-08-08',
	expiry: '2024-09-13',
	audience: 5 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: '',
	successMeasure: '',
	description: 'Test new spacefinder rules for inline1 ads on desktop.',
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
