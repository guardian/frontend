// @flow

export const commercialStackFreeze: ABTest = {
    id: 'CommercialStackFreeze',
    start: '2018-01-04',
    expiry: '2018-04-10',
    author: 'Pascal Honore & Jon Norman',
    description:
        'Holds back a segment of users from Q4 commercial features to measure the revenue/impact of the work in Q1',
    audience: 0.02,
    audienceOffset: 0,
    successMeasure:
        'A distinct difference in revenue/performance between the control group and those out of the test',
    audienceCriteria: 'All web traffic, inline slots',
    dataLinkNames: '',
    idealOutcome: 'We prove that extending our ad-stack generates more revenue',
    canRun: () => true,
    variants: [
        {
            id: 'frozen',
            test: () => {},
        },
        {
            id: 'non-frozen',
            test: () => {},
        },
    ],
};
