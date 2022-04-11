export type PrebidPriceGranularity = {
	buckets: Array<{
		precision?: number;
		max: number;
		increment: number;
	}>;
};

export const priceGranularity: PrebidPriceGranularity = {
	buckets: [
		{
			max: 100,
			increment: 0.01,
		},
		{
			max: 500,
			increment: 1,
		},
	],
};

export const criteoPriceGranularity: PrebidPriceGranularity = {
	buckets: [
		{
			max: 12,
			increment: 0.01,
		},
		{
			max: 20,
			increment: 0.05,
		},
		{
			max: 500,
			increment: 1,
		},
	],
};
