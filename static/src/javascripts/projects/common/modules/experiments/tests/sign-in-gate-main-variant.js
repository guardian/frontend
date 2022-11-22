// Main test is a feature switch where we roll out winning changes from other AB sign in gate tests
// variant audience sees the gate

export const signInGateMainVariant = {
	id: 'SignInGateMainVariant',
	start: '2020-05-20',
	expiry: '2025-12-01',
	author: 'Mahesh Makani',
	description:
		'Show sign in gate to 100% of users on 3rd article view of simple article templates, with higher priority over banners and epic. Main/Variant Audience.',
	audience: 0.7119,
	audienceOffset: 0.1254,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
		'3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
	ophanComponentId: 'main_variant_4',
	dataLinkNames: 'SignInGateMain',
	idealOutcome:
		'Increase the number of users signed in whilst running at a reasonable scale',
	showForSensitive: false,
	canRun: () => true,
	variants: [
		{
			id: 'main-variant-4',
			test: () => {},
		},
	],
};
