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

/**
 * Compute the price granularity for Ozone based on the width and height of the slot
 */
export const ozonePriceGranularity = (
	width: number,
	height: number,
): PrebidPriceGranularity | undefined => {
	switch ([width, height].join(',')) {
		case '160,600':
		case '300,600': {
			return {
				buckets: [
					{
						max: 10,
						increment: 0.01,
					},
					{
						max: 15,
						increment: 0.1,
					},
					{
						max: 50,
						increment: 1,
					},
				],
			};
		}
		case '728,90':
		case '970,250':
		case '300,250': {
			return {
				buckets: [
					{
						max: 12,
						increment: 0.01,
					},
					{
						max: 20,
						increment: 0.1,
					},
					{
						max: 50,
						increment: 1,
					},
				],
			};
		}
		default: {
			return undefined;
		}
	}
};
