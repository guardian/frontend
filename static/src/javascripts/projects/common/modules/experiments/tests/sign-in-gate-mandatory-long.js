export const signInGateMandatoryLongBucketingTestRun = {
	id: 'SignInGateMandatoryLongBucketingTestRun',
	start: '2022-10-05',
	expiry: '2022-12-01',
	author: 'vlbee',
	description:
		'Test run for long mandatory test - Show sign in gate to global users on 3rd article view of simple article templates, with higher priority over banners and epic.',
	audience: 0.0025,
	audienceOffset: 0.89,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
		'Global, 3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
	dataLinkNames: 'SignInGateMandatoryLongBucketingTestRun',
	idealOutcome:
		'Increase the number of users signed in whilst running at a reasonable scale',
	showForSensitive: false,
	canRun: () => false,
	variants: [
		{
			id: 'mandatory-long-bucketing-testrun',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongBucketingTestRunUk = {
	id: 'SignInGateMandatoryLongBucketingTestRunUk',
	start: '2022-10-05',
	expiry: '2022-12-01',
	author: 'vlbee',
	description:
		'Test run for long mandatory test - Show sign in gate to global users on 3rd article view of simple article templates, with higher priority over banners and epic.',
	audience: 0.0025,
	audienceOffset: 0.8925,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
		'Global, 3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
	dataLinkNames: 'SignInGateMandatoryLongBucketingTestRunUk',
	idealOutcome:
		'Increase the number of users signed in whilst running at a reasonable scale',
	showForSensitive: false,
	canRun: () => false,
	variants: [
		{
			id: 'mandatory-long-bucketing-testrun-uk',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongBucketingTestRunNa = {
	id: 'SignInGateMandatoryLongBucketingTestRunNa',
	start: '2022-10-05',
	expiry: '2022-12-01',
	author: 'vlbee',
	description:
		'Test run for long mandatory test - Show sign in gate to global users on 3rd article view of simple article templates, with higher priority over banners and epic.',
	audience: 0.0025,
	audienceOffset: 0.895,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
		'Global, 3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
	dataLinkNames: 'SignInGateMandatoryLongBucketingTestRunNA',
	idealOutcome:
		'Increase the number of users signed in whilst running at a reasonable scale',
	showForSensitive: false,
	canRun: () => false,
	variants: [
		{
			id: 'mandatory-long-bucketing-testrun-na',
			test: () => {},
		},
	],
};

export const signInGateMandatoryLongBucketingTestRunEu = {
	id: 'SignInGateMandatoryLongBucketingTestRunEu',
	start: '2022-10-05',
	expiry: '2022-12-01',
	author: 'vlbee',
	description:
		'Test run for long mandatory test - Show sign in gate to global users on 3rd article view of simple article templates, with higher priority over banners and epic.',
	audience: 0.0025,
	audienceOffset: 0.8975,
	successMeasure: 'Users sign in or create a Guardian account',
	audienceCriteria:
		'Global, 3rd article of the day, lower priority than consent banner, simple articles (not gallery, live etc.), not signed in, not shown after dismiss, not on help, info sections etc. Exclude iOS 9 and guardian-live-australia. Suppresses other banners, and appears over epics',
	dataLinkNames: 'SignInGateMandatoryLongBucketingTestRunEu',
	idealOutcome:
		'Increase the number of users signed in whilst running at a reasonable scale',
	showForSensitive: false,
	canRun: () => false,
	variants: [
		{
			id: 'mandatory-long-bucketing-testrun-eu',
			test: () => {},
		},
	],
};
