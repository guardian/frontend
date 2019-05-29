// @flow

export const commercialAdVerification: ABTest = {
    id: 'CommercialAdVerification',
    start: '2018-06-29',
    expiry: '2019-09-30',
    author: 'Jerome Eteve',
    description: 'This test will implemement our ad verification framework',
    audience: 1,
    audienceOffset: 0.0, // No overlap with PrebidSafeframe
    successMeasure: 'Impact of ad verification on yield or fillrate',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome:
        'No significant impact of ad verification on yield or fillrate',
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
