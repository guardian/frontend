// Main test is a feature switch where we roll out winning changes from other AB sign in gate tests
// variant audience sees the gate

export const signInGateMainVariant = {
	id: 'SignInGateMainVariant',
	start: '2020-05-20',
	expiry: '2025-12-01',
	author: 'Mahesh Makani',
	description:
		'TODO',
	audience: 0.9,
	audienceOffset: 0.0,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
		'TODO',
	ophanComponentId: 'main_variant_4',
	dataLinkNames: 'SignInGateMain',
	idealOutcome:
		'Increase the number of users signed in whilst running at a reasonable scale',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'sign-in-gate-copy-variant',
			test: () => {},
		},
	],
};
