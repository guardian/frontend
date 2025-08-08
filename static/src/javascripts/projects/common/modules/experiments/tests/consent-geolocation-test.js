
export const consentGeolocationTest = {
	id: 'ConsentGeolocationTest',
	start: '2025-07-30',
	expiry: '2025-12-01',
	author: 'Akinsola (Identity & Trust)',
	description:
		'This test is being used to monitor discrepancies between the sourcepoint geolocation and fastly geolocation.',
	audience: 0,
	audienceOffset: 0,
	successMeasure:
		'Users are shown the correct banner based on their geolocation',
	audienceCriteria: 'All users except Australia',
	idealOutcome:
		'Successfully track geolocation discrepancies',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'variant',
			test: () => {},
		},
	],
};
