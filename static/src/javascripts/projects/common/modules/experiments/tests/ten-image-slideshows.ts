import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const tenImageSlideshows: ABTest = {
	id: 'TenImageSlideshows',
	author: '@editorial-experience',
	start: '2023-04-24',
	expiry: '2023-05-01',
	description:
		'Test the impact of including 10 images in a slidehow rather than 5',
	audience: 0.5,
	audienceOffset: 0,
	audienceCriteria: 'All pageviews',
	successMeasure:
		'Page load time is not significantly affected by loading 10 images rather than 5',
	variants: [
		{ id: 'control-5-images', test: noop },
		{ id: 'varient-10-images', test: noop },
	],
	canRun: () => true,
};
