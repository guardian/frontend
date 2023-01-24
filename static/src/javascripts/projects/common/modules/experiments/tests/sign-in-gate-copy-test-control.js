// Main test is a feature switch where we roll out winning changes from other AB sign in gate tests
// control audience does not see the gate

export const signInGateCopyTestControl = {
	id: 'SignInGateCopyTestControl',
	start: '2023-01-23',
	expiry: '2025-12-01',
	author: 'Mahesh Makani',
	description:
		'TODO',
	audience: 0.1,
	audienceOffset: 0.9,
	successMeasure: 'N/A - User does not see gate, only to compare to variant.',
	audienceCriteria:
		'TODO',
	ophanComponentId: 'main_control_4',
	dataLinkNames: 'SignInGateCopyTest',
	idealOutcome:
		'Increase the number of users signed in whilst running at a reasonable scale',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'sign-in-gate-copy-control',
			test: () => {},
		},
	],
};
