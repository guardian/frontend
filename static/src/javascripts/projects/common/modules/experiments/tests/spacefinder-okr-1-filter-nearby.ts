import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const spacefinderOkr1FilterNearby: ABTest = {
	id: 'SpacefinderOkr1FilterNearby',
	author: 'Simon Byford (@simonbyford)',
	start: '2022-02-07',
	expiry: '2022-02-21',
	audience: 20 / 100,
	audienceOffset: 0,
	audienceCriteria: 'All pageviews on non-mobile, non-paid for articles',
	successMeasure:
		'Fixing the bug leads to an increase in inline programmatic revenue per 1000 pageviews',
	description:
		"Check whether fixing a bug in spacefinder's nearby candidate filtering mechanism leads to an increase in inline programmatic revenue per 1000 pageviews",
	variants: [
		{ id: 'control', test: noop },
		{ id: 'variant', test: noop },
	],
	canRun: () => true,
};
