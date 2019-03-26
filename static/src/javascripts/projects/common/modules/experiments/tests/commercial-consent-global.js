// @flow

export const commercialConsentGlobal: ABTest = {
    id: 'CommercialConsentGlobal',
    start: '2019-03-25',
    expiry: '2019-04-16',
    author: 'Frankie Hammond',
    description: 'Test the consent banner globally',
    audience: 0.02,
    audienceOffset: 0.1,
    successMeasure: 'Users outside of the EU interact with the consent banner',
    audienceCriteria: 'all users',
    dataLinkNames: '',
    idealOutcome: '',
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
