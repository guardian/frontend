import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const commercialEndOfQuarter2Test: ABTest = {
	id: 'CommercialEndOfQuarter2Test',
	author: 'Chris Jones (@chrislomaxjones)',
	start: '2022-05-30',
	expiry: '2022-07-05',
	audience: 10 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'All pageviews',
	successMeasure:
		'Enabling all changes leads to an increase in inline programmatic revenue per 1000 pageviews',
	description:
		'Check whether all changes made this quarter when combined lead to an increase in inline programmatic revenue per 1000 pageviews',
	variants: [
		{ id: 'control', test: noop },
		{ id: 'variant', test: noop },
	],
	canRun: () => true,
};
