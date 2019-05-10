// @flow
export const commercialPrebidSize: ABTest = {
    id: 'CommercialPrebidSize',
    start: '2019-05-13',
    expiry: '2019-06-13',
    author: 'George Haberis',
    description:
        'Test overriding the ad size from GAM with the ad size from prebid for prebid ads',
    audience: 0,
    audienceOffset: 0,
    successMeasure:
        'Prebid adverts should be rendered in the correct size ad slot',
    audienceCriteria: 'internal',
    dataLinkNames: '',
    idealOutcome:
        'Prebid adverts should be rendered in the correct size ad slot',
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
