// @flow

export const commercialIabCompliant: ABTest = {
    id: 'CommercialIabCompliant',
    start: '2018-08-13',
    expiry: '2019-10-30',
    author: 'Ricardo Costa',
    description: '0% participation AB test for the IAB compliant CMP',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'Our CMP is compliant with TCF IAB standards',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'CMP is compliant',
    showForSensitive: true,
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
