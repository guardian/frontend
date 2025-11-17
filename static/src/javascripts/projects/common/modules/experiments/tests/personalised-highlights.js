
export const personalisedHighlights = {
	id: 'PersonalisedHighlights',
	start: '2025-11-17',
	expiry: '2025-12-01',
	author: 'Anna Beddow',
	description: 'Allow user behaviour to personalise the ordering of cards in the highlights container.',
    audience: 0.75,
    audienceOffset: 0.75,
	successMeasure: '',
	audienceCriteria: 'All users, globally.',
    idealOutcome:
        'Increase click through rate on highlights container',
	showForSensitive: true,

	canRun: () => true,
	variants: [
		{
			id: 'control',
			test: () => {},
		},
        {
            id: 'click-tracking',
            test: () => {},
        },
        {
            id: 'view-tracking',
            test: () => {}
        },
        {
            id: 'click-and-view-tracking',
            test: () => {},
        },
	],
};

