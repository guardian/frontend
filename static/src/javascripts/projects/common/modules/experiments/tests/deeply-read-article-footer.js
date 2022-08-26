export const deeplyReadArticleFooterTest = {
    id: 'DeeplyReadArticleFooter',
    start: '2022-08-09',
    expiry: '2022-10-10',
    author: 'Joshua Lieberman and Daniel Clifton', 
    description:
        'Add new section to the article footer onwards that shows deeply read articles',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'Recirculation metrics are not worse',
    audienceCriteria:
        'all pageviews',
    dataLinkNames: 'DeeplyReadFooterLinks',
    idealOutcome:
        'AV is not worse',
    showForSensitive: true,
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
