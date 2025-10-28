
export const personalisedHighlights = {
	id: 'PersonalisedHighlights',
	start: '2025-10-29',
	expiry: '2025-12-04',
	author: 'Anna Beddow',
	description: 'Allow user behaviour to personalise the ordering of cards in the highlights container.',
    audience: 0,
	audienceOffset: 0,
	successMeasure: '',
	audienceCriteria: '',
	idealOutcome: '',
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

