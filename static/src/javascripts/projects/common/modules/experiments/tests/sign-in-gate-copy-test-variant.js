export const signInGateCopyTest = {
	id: 'SignInGateCopyTest',
	start: '2023-01-23',
	expiry: '2025-12-01',
	author: 'Lindsey Dew',
	description: 'TODO',
	audience: 0.1,
	audienceOffset: 0.0,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria: 'TODO',
	dataLinkNames: 'SignInGateCopyTest',
	idealOutcome:
		'Increase the number of users signed in whilst running at a reasonable scale',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'quick-and-easy',
			test: () => {},
		},
		{
			id: 'take-a-moment',
			test: () => {},
		}
	],
};
