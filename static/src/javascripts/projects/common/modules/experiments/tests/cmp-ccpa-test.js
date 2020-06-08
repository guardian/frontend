// @flow strict

export const ccpaCmpTest: ABTest = {
    id: 'CmpCcpaTest',
    start: '2020-06-04',
    expiry: '2020-07-01',
    author: 'Joshua Buckland',
    description: 'Test new CMP implementation for CCPA alongside TCFv1',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure:
        'CMP is compliant with CCPA in US and is compatible with existing TCFv1 CMP',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'The Sourcepoint CCPA CMP works with the existing TCFv1 CMP',
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
