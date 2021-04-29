export const signInGateFakeSocial = {
	id: 'SignInGateFakeSocial',
	start: '2021-05-29',
	expiry: '2021-06-29',
	author: 'Mahesh Makani',
	description:
		'We believe that if we show email input and/or social buttons on the gate, it will make the sign in process appear quicker and increase sign in conversion.',
	audience: 0.2,
	audienceOffset: 0.7,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
		'3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
	dataLinkNames: 'fake_social',
	idealOutcome:
		'Increase the number of users signed in whilst running at a reasonable scale',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'fake-social-control',
			test: () => {},
		},
		{
			id: 'fake-social-variant',
            test: () => { },
		},
	],
};
