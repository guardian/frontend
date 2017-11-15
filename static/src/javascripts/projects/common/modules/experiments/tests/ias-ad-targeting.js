// @flow

export const iasAdTargetingV2: ABTest = {
    id: 'IasAdTargetingV2',
    start: '2017-11-09',
    expiry: '2017-11-20',
    author: 'Jon Norman',
    description:
        'Adds additional targeting to ad slots, sourced from an IAS optimisation integration.',
    audience: 0.1,
    audienceOffset: 0.25,
    successMeasure:
        'Additional targeting ability with no discernable effect on ad performance and viewability.',
    audienceCriteria: 'Any user that will see ads.',
    dataLinkNames: '',
    idealOutcome:
        'Additional targeting information at no performance or viewability cost',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: () => {},
            success: () => {},
        },
        {
            id: 'variant',
            test: () => {},
            success: () => {},
        },
    ],
};
