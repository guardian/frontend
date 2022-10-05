import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const confiantSDKUpdateTest: ABTest = {
	id: 'ConfiantSdkUpdate',
	start: '2022-10-04',
	expiry: '2022-10-28',
	author: 'Jake Lee Kennedy',
	description: 'Test the new Confiant SDK, to share with the Confiant team',
	audience: 0,
	audienceOffset: 0,
	audienceCriteria: 'Opt in',
	successMeasure: 'No change/improved ad load times',
	canRun: () => true,
	variants: [
		{
			id: 'variant',
			test: () => noop,
		},
	],
};
