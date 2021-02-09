import { isInUk } from 'common/modules/commercial/geo-utils';

export const xaxisPrebidTest = {
    id: 'UpdatedXaxisPrebid',
    start: '2021-02-09',
    expiry: '2021-02-24',
    author: 'Ioanna Kyprianou',
    description: 'Test the performance of updated xaxis adapter in prebid',
    audience: 0.01,
    audienceOffset: 0.0,
    successMeasure: 'No negative impact',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Updated xaxis adapter works',
    showForSensitive: false,
    canRun: () => isInUk(),
    variants: [
        {
            id: 'control',
            test: () => {},
        },
        {
            id: 'variant',
            test: () => {},
        },
    ],
};
