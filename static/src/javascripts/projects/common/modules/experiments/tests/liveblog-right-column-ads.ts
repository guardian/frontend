import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const liveblogRightColumnAds: ABTest = {
	id: 'LiveblogRightColumnAds',
	author: '@commercial-dev',
	start: '2023-07-15',
	expiry: '2023-09-20',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'Desktop users with wide (1300px+) screens only',
	successMeasure:
		'Displaying an advert in the right-hand column on liveblog pages below the top 1000px of the content will have a significant revenue increase.',
	description:
		'Test the commercial impact of different advert display strategies in the right column on liveblog pages',
	variants: [
		{
			id: 'control',
			test: noop,
		},
		{
			id: 'minimum-stickiness',
			test: noop,
		},
		{
			id: 'multiple-adverts',
			test: noop,
		},
	],
	canRun: () => true,
};
