export const onwardJourneys = {
	id: 'OnwardJourneys',
	start: '2025-12-11',
	expiry: '2026-07-23',
	author: 'fronts.and.curation@guardian.co.uk',
	description: 'Testing the new Onward Journey component on all articles',
	audience: 0 / 100,
	audienceOffset: 0 / 100,
	successMeasure: 'Higher click-through rate',
	audienceCriteria: 'All articles on web (excludes apps)',
	showForSensitive: true,
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
