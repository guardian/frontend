// @flow

export const supportServerSideRendering: ABTest = {
    id: 'SupportServerSideRendering',
    start: '2019-01-30',
    expiry: '2019-05-22',
    author: 'Jonathan Rankin',
    description: 'Send half of the audience to the server-side rendered version of the support site',
    audience: 100,
    audienceOffset: 0,
    successMeasure: '£AV/impression',
    audienceCriteria: 'All',
    idealOutcome: 'Higher £AV/impression',
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
