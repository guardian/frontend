// @flow

export const commercialOutbrainNewids: ABTest = {
    id: 'CommercialOutbrainNewids',
    start: '2018-11-18',
    expiry: '2019-06-01',
    author: 'Jerome Eteve',
    description: 'Zero size AB test to allow testing new Outbrain Ids Scheme',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'n/a',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Outbrain people are happy with our implementation',
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
