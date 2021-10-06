import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const prebidTimeout: ABTest = {
	id: 'PrebidTimeout',
	author: 'Chris Jones (@chrislomaxjones)',
	start: '2021-10-6',
	expiry: '2021-10-22',
	audience: 0.03,
	audienceOffset: 0,
	audienceCriteria: 'All users',
	description:
		'Vary the length of the prebid timeout beyond which we stop accepting bids. See if varying this timeout leads to any changes in commercial timing metrics',
	successMeasure:
		'Varying the length of the prebid timeout has an effect on commercial timing metrics',
	variants: [
		{ id: 'variant500', test: noop },
		{ id: 'variant1500', test: noop },
		{ id: 'variant4000', test: noop },
	],
	canRun: () => true,
};
