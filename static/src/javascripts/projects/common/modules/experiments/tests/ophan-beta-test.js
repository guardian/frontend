export const OphanBetaTest = {
    id: 'OphanBetaTest',
    start: '2024-02-28',
    expiry: '2025-02-28',
    author: 'Ophan Dev',
    description:
        'Text experimental Heatphan features',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'Test users can see the latest Heatphan features',
    audienceCriteria:
        'all pageviews',
    dataLinkNames: 'RRHeaderLinks',
    idealOutcome:
        'Test users can see the latest Heatphan features',
    showForSensitive: true,
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: () => {},
        },
        {
            id: 'remote',
            test: () => {},
        },
    ],
};
