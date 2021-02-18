export const curatedContentCarouselTest = {
    id: 'CuratedContent3Carousel',
    start: '2021-02-18',
    expiry: '2021-03-08',
    author: 'buck06191',
    description:
        'Compare two carousel designs against existing fixed content for onwards journeys',
    audience: 0.05,
    audienceOffset: 0.95,
    successMeasure: 'The carousel drives increased engagement with onwards content as compared to control',
    audienceCriteria:
        '5% of all audience on articles',
    dataLinkNames: 'carousel-[large/small]-article-position-[X] where [X] is the index of the clicked card',
    idealOutcome:
        'We believe that we can increase onwards journey conversion using a carousel',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'curated-content-control',
            test: () => {},
        },
        {
            id: 'curated-content-variant-carousel-small',
            test: () => {},
        },
        {
            id: 'curated-content-variant-carousel-large',
            test: () => {},
        },

    ],
};
