// @flow

export const glabsTrafficDriverSlot: ABTest = {
    id: 'GlabsTrafficDriverSlot',
    start: '2017-07-24',
    expiry: '2017-08-23',
    author: 'Jon Norman',
    description:
        'Provides the ability to opt-in behind query param, so we can test a new ad slot that drives traffic to GLabs content.',
    audience: 0,
    audienceOffset: 0,
    successMeasure:
        'GLabs can opt in and play with traffic driving to Labs content',
    audienceCriteria: 'GLabs and Commercial Dev',
    dataLinkNames: '',
    idealOutcome: '',
    canRun: () => true,
    variants: [
        {
            id: 'opt-in-inline',
            test: () => {},
        },
        {
            id: 'opt-in-left',
            test: () => {},
        },
        {
            id: 'opt-out',
            test: () => {},
        },
    ],
};
