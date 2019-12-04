// @flow strict

export const permutiveTest: ABTest = {
    id: 'Permutive',
    start: '2019-11-12',
    expiry: '2020-07-30',
    author: 'Fares Basmadji',
    description: 'Test permutive implementation',
    audience: 0.1,
    audienceOffset: 0.0,
    successMeasure: 'Permutive to confirm functioning deployment',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Permutive implementation is successful',
    showForSensitive: true,
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
