// @flow

export const commercialConsentGlobal: ABTest = {
    id: 'CommercialConsentGlobal',
    start: '2019-03-25',
    expiry: '2019-04-16',
    author: 'Frankie Hammond',
    description: 'Test the TCF globally',
    audience: 0.02,
    audienceOffset: 0.1,
    successMeasure: 'TCF is served globally',
    audienceCriteria: 'internal',
    dataLinkNames: '',
    idealOutcome: 'TCF can be served globally',
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
