// @flow

export const commercialConsentOptionsButton: ABTest = {
    id: 'CommercialConsentOptionsButton',
    start: '2019-11-21',
    expiry: '2020-01-08',
    author: 'George Haberis',
    description:
        '0.5% AB test for a bottom consent banner with an options button instead of a link',
    audience: 0.005,
    audienceOffset: 0.85,
    successMeasure: 'Change does not adversely affect consent rates',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Consent rates stay the same.',
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
