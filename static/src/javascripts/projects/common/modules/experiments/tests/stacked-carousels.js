export const stackedCarousels = {
    id: 'StackedCarousels',
    start: '2025-05-30',
    expiry: '2025-08-20',
    author: 'Fronts & Curation',
    description: 'Test showing medium carousels as stacked cards',
    audience: 0 / 100,
    audienceOffset: 0 / 100,
    successMeasure: 'Overall click-through rate',
    audienceCriteria: 'All pageviews',
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
