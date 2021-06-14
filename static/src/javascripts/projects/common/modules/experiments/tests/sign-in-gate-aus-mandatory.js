export const signInGateAusMandatory = {
	id: 'SignInGateAusMandatory',
	start: '2020-06-07',
	expiry: '2021-12-01',
	author: 'Mahesh Makani',
	description:
		'Compare mandatory gate (an article sigin gate without the dismiss button) with the main signin gate for australia only',
	audience: 0.25,
	audienceOffset: 0.65,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
		'3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss or reshown after 5 dismisses, not on help, info sections etc. exclude iOS 9 and guardian-live-australia, AUS only, only users with specific CMP consents. Suppresses other banners, and appears over epics',
	dataLinkNames: 'SignInGateAusMandatory',
	idealOutcome:
		'We believe that a mandatory sign in gate will increase sign in conversion by 30% vs a dismissable sign in gate.',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'aus-mandatory-gate-control',
			test: () => {},
		},
		{
			id: 'aus-mandatory-gate-variant',
			test: () => {},
		},
	],
};
