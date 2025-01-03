export const onwardsContentArticle = {
	id: 'onwardsContentArticle',
	start: '2024-11-25',
	expiry: '2025-01-29',
	author: 'dotcom.platform@guardian.co.uk',
	description:
		'Test the impact of showing the galleries onwards content component on article pages.',
	audience: 50 / 100,
	audienceOffset: 50 / 100,
	audienceCriteria: 'Article pages',
	successMeasure:
		'Users are more likely to click a link in the onward content component.',
	canRun: () => true,
	variants: [
		{
			id: 'control',
			test: () => {},
		},
		{
			id: 'variant',
			test: () => {},
		},
	],
};
