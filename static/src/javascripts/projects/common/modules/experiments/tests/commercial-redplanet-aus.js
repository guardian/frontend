// @flow strict

import { isInAuOrNz } from 'common/modules/commercial/geo-utils';

export const commercialRedplanet: ABTest = {
    id: 'CommercialRedplanet',
    start: '2020-05-28',
    expiry: '2020-10-01',
    author: 'Ioanna Kyprianou',
    description: 'Test redplanet in AUS',
    audience: 0.01,
    audienceOffset: 0.0,
    successMeasure: 'Redplanet integration in AUS works',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Redplanet integration in AUS works',
    showForSensitive: true,
    canRun: () => isInAuOrNz(),
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
