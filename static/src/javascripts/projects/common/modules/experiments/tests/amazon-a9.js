// @flow strict
import { getSync as geolocationGetSync } from 'lib/geolocation';

export const amazonA9Test: ABTest = {
    id: 'CommercialA9',
    start: '2019-05-09',
    expiry: '2020-04-09',
    author: 'Ioanna Kyprianou',
    description: 'This is to test amazon a9 header bidding',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure: 'We can see amazon a9 bids ',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Amazon a9 successfully run in parallel with prebid',
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
