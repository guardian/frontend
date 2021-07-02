export const puzzlesBanner = {
    id: 'PuzzlesBanner',
    start: '2021-03-13',
    expiry: '2021-04-13',
    author: 'Lucy Monie Hall',
    description: '0% participation AB test for the puzzles banner',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'n/a',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'n/a',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: () => {},
        },
    ],
};
