// @flow

export const newsletterMerchUnit: ABTest = {
    id: 'NewsletterMerchUnit',
    start: '2020-11-02',
    expiry: '2020-12-01',
    author: 'Josh Buckland',
    description:
        'Show a newsletter advert in the merchandising unit to 50% of users',
    audience: 0.5,
    audienceOffset: 0.0,
    successMeasure: 'We see increased engagement from users shown the Newsletters ad unit',
    audienceCriteria:
        'Website users only.',
    ophanComponentId: 'newsletter_merch_unit',
    dataLinkNames: 'n/a',
    idealOutcome:
        'Increase engagement for lighthouse segments 4 and 5 via newsletters',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
