export const UsaExpandableMarketingCard = {
	id: 'UsaExpandableMarketingCard',
	start: '2024-11-18',
	expiry: '2025-01-29',
	author: 'dotcom.platform@guardian.co.uk',
	description:
		'Test the impact of showing the user a component that highlights the Guardians journalism.',
	audience: 40 / 100,
	audienceOffset: 0 / 100,
	audienceCriteria: 'US-based users that see the US edition.',
	successMeasure: 'Users are more likely to engage with the site.',
	canRun: () => true,
	variants: [
		{
			id: 'control',
			test: () => {},
		},
		{
			id: 'variant-free',
			test: () => {},
		},
		{
			id: 'variant-bubble',
			test: () => {},
		},
		{
			id: 'variant-billionaire',
			test: () => {},
		},
	],
};
