// @flow strict
import { getSync as geolocationGetSync } from 'lib/geolocation';
import once from 'lodash/once';

const currentGeoLocation = once((): string => geolocationGetSync());

export const pangaeaAdapterTest: ABTest = {
    id: 'CommercialPangaeaAdapter',
    start: '2019-10-08',
    expiry: '2020-07-30',
    author: 'Ioanna Kyprianou',
    description: 'Test adding pangaea in prebid for US',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure: 'Pangaea adapter works in prebid for US',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Pangaea adapter delivers in prebid for US',
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
