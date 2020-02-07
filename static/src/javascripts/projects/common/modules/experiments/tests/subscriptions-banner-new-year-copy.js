// @flow strict
import { getSync as geolocationGetSync } from 'lib/geolocation';

const geolocation = geolocationGetSync();

export const subscriptionsBannerNewYearCopyTest: ABTest = {
    id: 'SubsBannerNewYearCopyTest',
    start: '2020-02-03',
    expiry: '2020-03-10',
    author: 'Jon Soul',
    description: 'Test headline copy variant on the subscriptions banner',
    audience: 1,
    audienceOffset: 0,
    successMeasure: 'Conversion rate',
    audienceCriteria: 'n/a',
    idealOutcome: 'Higher conversions based on new year copy',
    canRun: () => geolocation !== 'US', // Banner is live in the US but we are not testing there
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
