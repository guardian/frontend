// @flow strict

import type { PrebidPriceGranularity } from 'commercial/modules/prebid/types';

export const priceGranularity: PrebidPriceGranularity = {
    buckets: [
        {
            min: 0,
            max: 100,
            increment: 0.01,
        },
        {
            min: 100,
            max: 500,
            increment: 1,
        },
    ],
};
