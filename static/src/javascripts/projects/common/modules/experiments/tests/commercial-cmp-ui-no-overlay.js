// @flow

export const commercialCmpUiNoOverlay: ABTest = {
    id: 'CommercialCmpUiNoOverlay',
    start: '2019-11-21',
    expiry: '2019-01-08',
    author: 'Ricardo Costa',
    description:
        '0.5% AB test for an IAB compliant consent banner with no overlay',
    audience: 0.005,
    audienceOffset: 0.8,
    successMeasure: 'Consent rates improve',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Consent rates improve massively',
    showForSensitive: true,
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
