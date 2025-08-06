
export const googleOneTap = {
	id: 'GoogleOneTap',
	start: '2025-07-30',
	expiry: '2025-12-01',
	author: 'Ash (Identity & Trust)',
	description:
		'This test is being used to prototype and roll out single sign-on with Google One Tap.',
	audience: 0,
	audienceOffset: 0,
	successMeasure:
		'There are no new client side errors and the users are able to sign in with Google One Tap',
	audienceCriteria: 'Signed-out Chrome Users on Fronts',
	idealOutcome:
		'Increased sign in conversion rate for users who have Google accounts and Chrome',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'variant',
			test: () => {},
		},
	],
};
