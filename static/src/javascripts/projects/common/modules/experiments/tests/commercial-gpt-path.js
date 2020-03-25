// @flow strict

export const commercialGptPath: ABTest = {
    id: 'CommercialGptPath',
    start: '2020-03-26',
    expiry: '2020-04-26',
    author: 'George Haberis',
    description: '0% a/b test for new gpt.js path',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure: 'n/a',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'New gpt.js path does not adversely affect advertisement',
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
