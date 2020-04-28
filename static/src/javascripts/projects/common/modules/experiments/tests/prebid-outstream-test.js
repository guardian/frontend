// @flow strict

export const prebidOutstream: ABTest = {
    id: 'PrebidOutstream',
    start: '2020-04-28',
    expiry: '2020-05-31',
    author: 'Francis Carr',
    description: 'Test Prebid outstream with Ozone in inline1 (This enables it for all partners)',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure: 'We receive outstream video from Ozone and potentially other partners',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Outstream works in inline1 alone with normal display ads',
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
