// @flow

export const journalismInArticleAudioAtomZeroPercent: ABTest = {
    id: 'JournalismInArticleAudioAtomZeroPercent',
    start: '2019-01-10',
    expiry: '2019-03-31',
    author: 'Justin Pinner',
    description: 'Manual opt-in test for in-article audio atom rendering',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'N/A (internal zero percent test)',
    audienceCriteria: 'N/A',
    dataLinkNames: 'N/A',
    idealOutcome: 'N/A (internal people can preview the atom prior to rollout)',
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
