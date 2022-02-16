import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const spacefinderOkr2ImagesLoaded: ABTest = {
	id: 'SpacefinderOkr2ImagesLoaded',
	author: 'Simon Byford (@simonbyford)',
	start: '2022-02-16',
	expiry: '2022-02-28',
	audience: 10 / 100,
	audienceOffset: 20 / 100,
	audienceCriteria: 'All pageviews',
	successMeasure:
		'Fixing the bug leads to an increase in inline programmatic revenue per 1000 pageviews',
	description:
		"Check whether fixing spacefinder's ability to detect when images have loaded leads to an increase in inline programmatic revenue per 1000 pageviews",
	variants: [
		{ id: 'control', test: noop },
		{ id: 'variant', test: noop },
	],
	canRun: () => true,
};
