// @flow strict
import { getSync as geolocationGetSync } from 'lib/geolocation';
import once from 'lodash/once';

const currentGeoLocation = once((): ?string => geolocationGetSync());

export const pangaeaAdapterTest: ABTest = {
    id: 'CommercialPangaeaAdapter',
    start: '2019-10-08',
    expiry: '2020-07-30',
    author: 'Ioanna Kyprianou',
    description: 'Test adding pangaea in prebid in US & AU regions',
    audience: 0.0,
    audienceOffset: 0.0,
    successMeasure: 'Pangaea adapter works in prebid for US & AU regions',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Pangaea adapter delivers in prebid for US & AU regions',
    showForSensitive: true,
    canRun: () => ['US', 'CA', 'AU', 'NZ'].includes(currentGeoLocation()),
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
