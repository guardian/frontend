// @flow

export const commercialGptLazyLoad: ABTest = {
    id: 'CommercialGptLazyLoad',
    start: '2020-03-02',
    expiry: '2020-03-10',
    author: 'George Haberis',
    description:
        'This test enables GPT enableLazyLoad as an alternative to our custom build lazy load solution',
    audience: 0.01,
    audienceOffset: 0,
    successMeasure: 'Measurement of ad impressions',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome:
        'GPT enableLazyLoad outperforms our custom built lazy load solution',
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
