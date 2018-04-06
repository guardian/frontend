// @flow

export const spacefinderSimplify: ABTest = {
    id: 'SpacefinderSimplify',
    start: '2018-03-05',
    expiry: '2018-04-17',
    author: 'Jon Norman',
    description:
        'This test alters the rules for inserting ads on desktop breakpoints.',
    audience: 0.1,
    audienceOffset: 0.7,
    successMeasure: 'No negative impact on attention time',
    audienceCriteria: 'All web traffic.',
    dataLinkNames: '',
    idealOutcome:
        'We increase the number of ads in articles whilst understanding any aesthetic issues that arise.',
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: () => {},
        },
        {
            id: 'control',
            test: () => {},
        },
    ],
};
