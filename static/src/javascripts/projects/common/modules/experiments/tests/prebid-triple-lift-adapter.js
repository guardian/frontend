// @flow strict
import { getSync as geolocationGetSync } from 'lib/geolocation';

export const prebidTripleLiftAdapter: ABTest = {
    id: 'CommercialPrebidTripleLiftAdapter',
    start: '2019-07-30',
    expiry: '2020-07-30',
    author: 'Ioanna Kyprianou',
    description: 'This is to test triplelift adapter in prebid',
    audience: 0.1,
    audienceOffset: 0.0,
    successMeasure: 'We can see triplelift bids in prebid',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome:
        'No significant impact to performance as well as higher ad yield',
    showForSensitive: true,
    canRun: () => ['US', 'CA'].includes(geolocationGetSync()),
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
