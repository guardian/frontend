// @flow

import { getTestVariantId } from 'common/modules/experiments/utils';
import config from 'lib/config';

export const prebidIntegration: ABTest = {
    id: 'PrebidIntegration',
    start: '2017-12-28',
    expiry: '2018-04-02',
    author: 'Richard Nguyen',
    description:
        'A test to verify that Prebid can support external demand for display ads',
    audience: 0.0,
    audienceOffset: 0,
    successMeasure: 'Higher OMP (Open Market Place) yield',
    audienceCriteria: 'All web traffic, inline slots',
    dataLinkNames: '',
    idealOutcome: 'We prove that extending our ad-stack generates more revenue',
    canRun: () => true,
    variants: [
        {
            id: 'prebid-variant',
            test: () => {},
        },
        {
            id: 'control',
            test: () => {},
        },
    ],
};

export const determineExternalDemand = (): string => {
    if (getTestVariantId(prebidIntegration.id) === 'prebid-variant') {
        return config.switches.abPrebidIntegration ? 'prebid' : 'none';
    }
    return config.switches.sonobiHeaderBidding ? 'sonobi' : 'none';
};
