// @flow strict

export const connatixTest: ABTest = {
    id: 'CommercialConnatix',
    start: '2020-12-03',
    expiry: '2020-12-04',
    author: 'Ioanna Kyprianou',
    description: 'This is to test connatix integration',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure: 'We can test connatix integration ',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Conantix integration',
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
