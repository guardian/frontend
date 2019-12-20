// @flow strict

export const subscriptionsBannerNewYearCopyTest: ABTest = {
    id: 'SubsBannerNewYearCopyTest',
    start: '2019-11-12', // TODO: update for 6th Jan
    expiry: '2020-02-25',
    author: 'Jon Soul',
    description: 'Test new copy on the subscriptions banner', // TODO: is this accurate based on final design implemented?
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'Conversion rate',
    audienceCriteria: 'n/a',
    idealOutcome: 'Higher conversions based on new copy',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
