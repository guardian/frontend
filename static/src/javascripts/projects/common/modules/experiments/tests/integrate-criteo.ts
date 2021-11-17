import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const integrateCriteo: ABTest = {
	id: 'IntegrateCriteo',
	author: 'Chris Jones (@chrislomaxjones)',
	start: '2021-11-22',
	expiry: '2022-01-10',
	audience: 2 / 100,
	audienceOffset: 0,
	audienceCriteria: 'All users',
	description:
		'Integrate new Prebid bidder and measure revenue uplift / impact of commercial performance metrics',
	successMeasure:
		'Revenue uplift with no significant impact on performance metrics',
	variants: [
		{ id: 'control', test: noop },
		{ id: 'variant', test: noop },
	],
	canRun: () => true,
};
