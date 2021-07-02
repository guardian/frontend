export const signInGateUsMandatory = {
	id: 'SignInGateUsMandatory',
	start: '2020-06-28',
	expiry: '2021-12-01',
	author: 'Identity Team',
	description:
        'Compare mandatory gate (an article sigin gate without the dismiss button) with the main signin gate for US only',
    audience: 0.25,
	audienceOffset: 0.65,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
        '3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss or reshown after 5 dismisses, not on help, info sections etc. exclude iOS 9 and guardian-live, US only, only users with specific CMP consents. Suppresses other banners, and appears over epics',
    dataLinkNames: 'SignInGateUsMandatory',
	idealOutcome:
		'We believe that a mandatory sign in gate will increase sign in conversion by 30% vs a dismissable sign in gate.',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'us-mandatory-gate-control',
			test: () => {},
		},
		{
			id: 'us-mandatory-gate-variant',
			test: () => {},
		},
	],
};
