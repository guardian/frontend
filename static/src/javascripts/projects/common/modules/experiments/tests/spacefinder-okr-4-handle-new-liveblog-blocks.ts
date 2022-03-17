import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const spacefinderOkr4HandleNewLiveblogBlocks: ABTest = {
	id: 'SpacefinderOkr4HandleNewLiveblogBlocks',
	author: 'Simon Byford (@simonbyford) & Zeke Hunter-Green (@zekehuntergreen)',
	start: '2022-03-22',
	expiry: '2022-05-02',
	audience: 10 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'All pageviews',
	successMeasure:
		'Fixing the bug leads to an increase in inline programmatic revenue per 1000 pageviews',
	description:
		"Check whether fixing spacefinder's ability to re-run when new liveblog blocks are added leads to an increase in inline programmatic revenue per 1000 pageviews",
	variants: [
		{ id: 'control', test: noop },
		{ id: 'variant', test: noop },
	],
	canRun: () => true,
};
