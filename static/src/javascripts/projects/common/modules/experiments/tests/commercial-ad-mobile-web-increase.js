// @flow

export const commercialAdMobileWebIncrease: ABTest = {
    id: 'CommercialAdMobileWebIncrease',
    start: '2018-11-16',
    expiry: '2018-12-20',
    author: 'Francesca Hammond',
    description: 'This test will increase ads on mobile web',
    audience: 0.1,
    audienceOffset: 0.02,
    successMeasure: 'More ads on mobile web compared to AMP',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Match or better number of ads on mobile web compared to AMP',
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
