// @flow

export const commercialCmpCustomise: ABTest = {
    id: 'CommercialCmpCustomise',
    start: '2018-08-13',
    expiry: '2019-09-30',
    author: 'Kate Whalen',
    description: '0% participation AB test for customising CMP data',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'Customisation of CMP data',
    audienceCriteria: 'internal',
    dataLinkNames: '',
    idealOutcome: 'Different CMP result',
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
