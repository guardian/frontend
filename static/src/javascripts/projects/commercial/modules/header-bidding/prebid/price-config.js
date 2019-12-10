// @flow strict

type PrebidPriceGranularity = {
    buckets: Array<{
        precision?: number,
        min: number,
        max: number,
        increment: number,
    }>,
};

export type { PrebidPriceGranularity };

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
