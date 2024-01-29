import detect from 'lib/detect';

export const crosswordMobileBanner = () => {
    const properties = {
        id: 'CrosswordMobileBanner',
        author: '@commercial-dev',
        start: '2024-02-02',
        expiry: '2024-02-27',
        description: 'Add banner ad to various positions in mobile crossword ad.',
        audience: 0.0,
        audienceOffset: 0.0,
        showForSensitive: false,
        successMeasure: 'See impact of various ad positions on impressions',
        audienceCriteria: 'Users who view crossword pages on mobile',
        idealOutcome: 'Test different position of banners ads with most impact on impressions.',
        variants: [
            { id: 'control', test: noop },
            { id: 'variant', test: noop },
        ],
        canRun: () => true,
    };
}
