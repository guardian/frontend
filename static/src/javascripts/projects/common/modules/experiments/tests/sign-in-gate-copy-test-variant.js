export const signInGateCopyTestJan2023 = {
	id: 'SignInGateCopyTestJan2023',
	start: '2023-01-23',
	expiry: '2023-05-01',
	author: 'Lindsey Dew',
	description: 'Test varying the copy in the call to action for sign in gate',
	audience: 0.2,
	audienceOffset: 0.0,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria: '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
	dataLinkNames: 'SignInGateCopyTest',
	idealOutcome:
		'One variants performs at least 2% better than the control and/OR 10% better than the other variant. Neither variant performs 5% worse than the control',
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
