import type { ABTest } from '@guardian/ab-core';
import { noop } from '../../../../../lib/noop';

export const removeBusinessLiveblogEpics: ABTest = {
	id: 'RemoveBusinessLiveblogEpics',
	start: '2022-05-24',
	expiry: '2023-07-10',
	author: '@commercial-dev',
	description:
		'Test the commercial impact of removing contribution epics on business liveblogs',
	audience: 20 / 100,
	audienceOffset: 20 / 100,
	audienceCriteria: 'Business liveblogs',
	successMeasure: 'Ad revenue increases on business liveblogs',
	canRun: () => window.guardian.config.page.contentType === 'LiveBlog',
	variants: [
		{ id: 'control', test: () => noop },
		{ id: 'variant', test: () => noop },
	],
};
