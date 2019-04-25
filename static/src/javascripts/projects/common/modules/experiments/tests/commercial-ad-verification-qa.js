// @flow

export const commercialAdVerificationQA: ABTest = {
    id: 'CommercialAdVerificationQA',
    start: '2018-06-29',
    expiry: '2019-09-30',
    author: 'Ricardo Costa',
    description: 'This test will implemement our ad verification framework for QA (0% audience/manual optIn)',
    audience: 0.0,
    audienceOffset: 0.0,
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
