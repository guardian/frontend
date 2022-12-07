import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const billboardsInMerch: ABTest = {
	id: 'BillboardsInMerch',
	author: '@commercial-dev',
	start: '2022-12-07',
	expiry: '2023-02-31',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'Opt in only',
	successMeasure:
		'Test the commercial impact of showing billboard adverts in merchandising slots',
	description:
		'Show billboard adverts in merchandising slots to browsers in the variant',
	variants: [
		// TODO Bypass metrics sampling once we increase audience size
		{ id: 'control', test: noop },
		// TODO Bypass metrics sampling once we increase audience size
		{ id: 'variant', test: noop },
	],
	canRun: () => true,
};
