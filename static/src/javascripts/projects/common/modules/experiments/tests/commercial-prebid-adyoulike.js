// @flow strict

export const commercialPrebidAdYouLike: ABTest = {
    id: 'CommercialPrebidAdYouLike',
    start: '2018-08-20',
    expiry: '2018-09-26',
    author: 'Kelvin Chappell',
    description: 'Serve different styles of AdYouLike creatives',
    audience: 0,
    audienceOffset: 0,
    successMeasure: 'Successful rendering of creative',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'All variants render successfully',
    canRun: () => true,
    variants: [
        {
            id: 'aylStyle',
            options: {
                placementId: '0da4f71dbe8e1af5c0e4739f53366020',
            },
            test: (): void => {},
        },
        {
            id: 'guardianStyle',
            options: {
                placementId: '2b4d757e0ec349583ce704699f1467dd',
            },
            test: (): void => {},
        },
    ],
};
