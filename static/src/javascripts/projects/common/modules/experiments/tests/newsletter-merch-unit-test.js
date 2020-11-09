// @flow

export const newsletterMerchUnit: ABTest = {
    id: 'NewsletterMerchUnit',
    start: '2020-11-12',
    expiry: '2020-12-01',
    author: 'Josh Buckland',
    description:
        'Show a newsletter advert in the merchandising unit to 50% of users',
    audience: 1.0,
    audienceOffset: 0.0,
    successMeasure: 'We see increased engagement from users shown the Newsletters ad unit',
    audienceCriteria:
        'Website users only.',
    ophanComponentId: 'newsletter_merch_unit',
    dataLinkNames: 'n/a',
    idealOutcome:
        'Investigate lighthouse segment engagement via newsletters',
    showForSensitive: false,
    canRun: () => true,
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'variant',
            test: (): void => {},
        }
    ],
};
