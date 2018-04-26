// @flow

export const signInEngagementBannerDisplay: ABTest = {
    id: 'SignInEngagementBannerDisplay',
    start: '2018-04-26',
    expiry: '2018-05-26',
    author: 'Laura gonzalez',
    description:
        'This test will show a sign in engagement banner to non signed in users.',
    audience: 0,
    audienceOffset: 0.25,
    successMeasure: 'More signed in users as % of visitors',
    audienceCriteria: 'All web traffic',
    dataLinkNames: 'All starting with "sign-in-eb :"',
    idealOutcome:
        'We increase the number of signed in users more than the banner puts people off visiting the site.',
    variants: [
        {
            id: 'variant',
            test: () => {},
        },
        {
            id: 'control',
            test: () => {},
        },
    ],
};
