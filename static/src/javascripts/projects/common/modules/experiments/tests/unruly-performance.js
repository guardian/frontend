// @flow

export const unrulyPerformanceTest: ABTest = {
    id: 'UnrulyPerformanceTest',
    start: '2017-11-10',
    expiry: '2018-04-18',
    author: 'Francis Carr',
    description:
        'This test removes 5% of users from Unruly to measure performance impact',
    audience: 0.1,
    audienceOffset: 0,
    successMeasure: 'No negative impact on attention time',
    audienceCriteria: 'All web traffic.',
    dataLinkNames: '',
    idealOutcome: 'We are informed on the impact of Unruly videos to users',
    canRun: () => true,
    variants: [
        {
            id: 'serve-unruly',
            test: () => {},
        },
        {
            id: 'control',
            test: () => {},
        },
    ],
};
