import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const liveblogDesktopOutstream: ABTest = {
	id: 'IntegrateIma',
	start: '2022-12-02',
	expiry: '2023-01-31',
	author: 'Jake Lee Kennedy',
	description:
		'Test the impact of enabling outstream on inline2+ on liveblogs on desktop',
	audience: 95 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'Opt in',
	successMeasure: 'No significant impact to CWV',
	canRun: () => true,
	variants: [
		{ id: 'control', test: () => noop },
		{ id: 'variant', test: () => noop },
	],
};
