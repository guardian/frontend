// @flow strict

export const amazonA9Test: ABTest = {
    id: 'CommercialA9',
    start: '2019-05-09',
    expiry: '2020-06-01',
    author: 'Ioanna Kyprianou',
    description: 'This is to test amazon a9 header bidding',
    audience: 0.01,
    audienceOffset: 0.0,
    successMeasure: 'We can see amazon a9 bids ',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Amazon a9 successfully run in parallel with prebid',
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
