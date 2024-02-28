export const OphanBetaTest = {
    id: 'OphanBetaTest',
    start: '2024-02-28',
    expiry: '2025-02-28',
    author: 'Ophan Dev',
    description:
        'Text experimental Heatphan features',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'AV is not worse',
    audienceCriteria:
        'all pageviews',
    dataLinkNames: 'RRHeaderLinks',
    idealOutcome:
        'AV is not worse',
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
