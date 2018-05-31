// @flow

export const firstPvConsentBlocker: ABTest = {
    id: 'FirstPvConsentBlocker',
    start: '2018-05-31',
    expiry: '2019-05-31',
    author: 'Laura gonzalez',
    description: 'This test will make the cookie consent banner blocking.',
    audience: 0.3,
    audienceOffset: 0.7,
    successMeasure: 'More consents',
    audienceCriteria: 'All web traffic who can see the banner',
    dataLinkNames: '"privacy-prefs" component',
    idealOutcome:
        'We increase the number of consents without getting an equal number of explicit nos or damaging the guardian brand.',
    canRun: () => true,
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
