// @flow

import type { PrebidPriceGranularity } from 'commercial/modules/prebid/types';

export const priceGranularity: PrebidPriceGranularity = {
    buckets: [
        {
            min: 0,
            max: 5,
            increment: 0.05,
        },
        {
            min: 5,
            max: 10,
            increment: 0.1,
        },
        {
            min: 10,
            max: 20,
            increment: 0.5,
        },
        {
            min: 20,
            max: 40,
            increment: 10,
        },
    ],
};
