export const fiveFourImages = {
    id: 'FiveFourImages',
    start: '2025-02-20',
    expiry: '2026-01-30',
    author: 'dotcom.platform@guardian.co.uk',
    description: 'Compare 5:4 vs 5:3 aspect ratio in article main media images',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'There is not any negative change to the metrics on the variant of the article pages',
    audienceCriteria: '',
    ophanComponentId: 'five_four_images',
    dataLinkNames: 'FiveFourImages',
    idealOutcome: '',
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: () => {},
        },
        {
            id: 'variant',
            test: () => {},
        },
    ],
};
