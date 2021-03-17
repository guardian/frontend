export const signInGateMandoryTest = {
	id: 'SignInGateMandatory',
	start: '2021-03-04',
	expiry: '2021-06-04',
	author: 'Peter Colley',
	description:
		'Compare mandatory gate (an article sigin gate without the dismiss button) with the main signin gate',
	audience: 0.20,
	audienceOffset: 0.70,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
		'3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss or reshown after 5 dismisses, not on help, info sections etc. exclude iOS 9 and guardian-live-australia, UK only, only users with specific CMP consents. Suppresses other banners, and appears over epics',
	dataLinkNames: 'SignInGateMandatory',
	idealOutcome:
		'We believe that a mandatory sign in gate will increase sign in conversion by 30% vs a dismissable sign in gate.',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'mandatory-gate-control',
			test: () => {},
		},
		{
			id: 'mandatory-gate-variant',
			test: () => {},
		},
	],
};
