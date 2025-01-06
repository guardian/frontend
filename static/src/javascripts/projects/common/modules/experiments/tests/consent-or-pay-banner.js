export const consentOrPayBannerTest = {
    id: 'ConsentOrPayBannerTest',
    start: '2025-01-01',
    expiry: '2025-12-31',
    author: 'Akinsola Lawanson',
    description:
        'Test the consent or pay banner',
    audience: 0.1,
    audienceOffset: 0,
    successMeasure: 'TBC',
    audienceCriteria:
        'all pageviews in UK',
    dataLinkNames: 'consent-or-pay-banner',
    idealOutcome: 'TBC',
    canRun : () => true,
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
}
