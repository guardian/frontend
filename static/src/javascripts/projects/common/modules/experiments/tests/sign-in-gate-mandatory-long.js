const sharedTestData = {
	start: '2022-10-11',
	expiry: '2023-01-31',
	author: 'vlbee',
	description:
		'Long-running mandatory sign in gate - Show gate to global users on 3rd article view of simple article templates, with higher priority over banners and epic.',
	audienceCriteria:
		'Restricted by region, 3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
	successMeasure:
		'Primary metric will be the average attention time per browser. Secondary: Average page views per browser, Sessions per browser, Gate conversion rate, Average days between visits, Engagement score, Reader revenue, Programmatic ad revenue',
	idealOutcome:
		'Significantly grow the number of registered and signed in users amongst this cohort, with appropriate permissions but achieve this without meaningfully denting engagement with our journalism or long-term ad revenue',
	showForSensitive: false,
	canRun: () => false,
};

export const signInGateMandatoryLongTestControlUk = {
	...sharedTestData,
	id: 'SignInGateMandatoryLongTestControlUk',
	audience: 0.0393,
	audienceOffset: 0,
	dataLinkNames: 'SignInGateMandatoryLongTestControlUk',
	variants: [
		{
			id: 'mandatory-long-test-control-uk',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongTestVariantUk = {
	...sharedTestData,
	id: 'SignInGateMandatoryLongTestVariantUk',
	audience: 0.0182,
	audienceOffset: 0.8373,
	dataLinkNames: 'SignInGateMandatoryLongTestVariantUk',
	variants: [
		{
			id: 'mandatory-long-test-variant-uk',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongTestControlNa = {
	...sharedTestData,
	id: 'SignInGateMandatoryLongTestControlNa',
	audience: 0.1131,
	audienceOffset: 0,
	dataLinkNames: 'SignInGateMandatoryLongTestControlNA',
	variants: [
		{
			id: 'mandatory-long-test-control-na',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongTestVariantNa = {
	...sharedTestData,
	id: 'SignInGateMandatoryLongTestVariantNa',
	audience: 0.0544,
	audienceOffset: 0.8373,
	dataLinkNames: 'SignInGateMandatoryLongTestVariantNA',
	variants: [
		{
			id: 'mandatory-long-test-variant-na',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongTestControlAunz = {
	...sharedTestData,
	id: 'SignInGateMandatoryLongTestControlAunz',
	audience: 0.1254,
	audienceOffset: 0,
	dataLinkNames: 'SignInGateMandatoryLongTestControlAunz',
	variants: [
		{
			id: 'mandatory-long-test-control-aunz',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongTestVariantAunz = {
	...sharedTestData,
	id: 'SignInGateMandatoryLongTestVariantAunz',
	audience: 0.0627,
	audienceOffset: 0.8373,
	dataLinkNames: 'SignInGateMandatoryLongTestVariantAunz',
	variants: [
		{
			id: 'mandatory-long-test-variant-aunz',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongTestControlEu = {
	...sharedTestData,
	id: 'SignInGateMandatoryLongTestControlEu',
	audience: 0.0773,
	audienceOffset: 0,
	dataLinkNames: 'SignInGateMandatoryLongTestControlEu',
	variants: [
		{
			id: 'mandatory-long-test-control-eu',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongTestVariantEu = {
	...sharedTestData,
	id: 'SignInGateMandatoryLongTestVariantEu',
	audience: 0.0365,
	audienceOffset: 0.8373,
	dataLinkNames: 'SignInGateMandatoryLongTestVariantEu',
	variants: [
		{
			id: 'mandatory-long-test-variant-eu',
			test: () => {},
		},
	],
};
