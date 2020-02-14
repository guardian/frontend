// @flow strict
import { getSync as geolocationGetSync } from 'lib/geolocation';
import once from 'lodash/once';

const currentGeoLocation = once((): ?string => geolocationGetSync());

export const appnexusUSAdapter: ABTest = {
    id: 'CommercialAppnexusUsAdapter',
    start: '2019-10-7',
    expiry: '2020-07-30',
    author: 'Ioanna Kyprianou',
    description: 'Test new us placement id for appnexus in US',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure: 'Appnexus adapter works in US',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Appnexus adapter delivers in US',
    showForSensitive: true,
    canRun: () => ['US', 'CA'].includes(currentGeoLocation()),
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
