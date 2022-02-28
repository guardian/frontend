import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const spacefinderOkr3RichLinks: ABTest = {
	id: 'SpacefinderOkr3RichLinks',
	author: 'Simon Byford (@simonbyford)',
	start: '2022-02-28',
	expiry: '2022-03-21',
	audience: 20 / 100,
	audienceOffset: 30 / 100,
	audienceCriteria: 'All pageviews',
	successMeasure:
		'Fixing the bug leads to an increase in inline programmatic revenue per 1000 pageviews',
	description:
		'Check whether ignoring rich links in spacefinder on desktop leads to an increase in inline programmatic revenue per 1000 pageviews',
	variants: [
		{ id: 'control', test: noop },
		{ id: 'variant', test: noop },
	],
	canRun: () => true,
};
