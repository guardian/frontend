// @flow

export const newsletterMerchUnitLighthouseControl: ABTest = {
    id: 'NewsletterMerchUnitLighthouse',
    start: '2020-11-11',
    expiry: '2020-12-01',
    author: 'Josh Buckland & Alex Dufournet',
    description: 'Show BAU merch unit to 50% of users. This is the control for the NewsletterMerchUnitLighthouseVariants test.',
    audience: 0.5,
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
        }
    ],
};

export const newsletterMerchUnitLighthouseVariant: ABTest = {
    id: 'NewsletterMerchUnitLighthouse',
    start: '2020-11-11',
    expiry: '2020-12-01',
    author: 'Josh Buckland & Alex Dufournet',
    description: 'Show a newsletter advert in the merchandising unit to 25% of users. ' +
        'These two variants test value of showing newsletter merch units instead of reader revenue ones. ' +
        'This test needs to run at the same time as NewsletterMerchUnitLighthouseControl',
    audience: 0.5,
    audienceOffset: 0.5,
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
            id: 'newsletter',
            test: (): void => {},
        },
        {
            id: 'reader-revenue',
            test: (): void => {},
        }
    ],
};
