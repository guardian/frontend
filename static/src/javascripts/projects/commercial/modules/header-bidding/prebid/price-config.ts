// @flow strict

type PrebidPriceGranularity = {
  buckets: Array<{
    precision?: number;
    max: number;
    increment: number;
  }>;
};

export type { PrebidPriceGranularity };

export const priceGranularity: PrebidPriceGranularity = {
  buckets: [{
    max: 100,
    increment: 0.01
  }, {
    max: 500,
    increment: 1
  }]
};
