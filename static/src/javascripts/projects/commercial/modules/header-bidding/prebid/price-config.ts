import { adSizes } from '@guardian/commercial-core';

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
	const sizeString = [width, height].join(',');

	if (
		sizeString === adSizes.skyscraper.toString() ||
		sizeString === adSizes.halfPage.toString()
	) {
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

	if (
		sizeString === adSizes.leaderboard.toString() ||
		sizeString === adSizes.billboard.toString() ||
		sizeString === adSizes.mpu.toString() ||
		sizeString === adSizes.outstreamDesktop.toString() ||
		sizeString === adSizes.outstreamMobile.toString()
	) {
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

	return undefined;
};

export const indexPrebidPriceGranularity = (
	width: number,
	height: number,
): PrebidPriceGranularity | undefined => {
	const sizeString = [width, height].join(',');

	if (
		sizeString === adSizes.skyscraper.toString() ||
		sizeString === adSizes.halfPage.toString()
	) {
		return {
			buckets: [
				{
					max: 10,
					increment: 0.01,
				},
				{
					max: 15,
					increment: 0.05,
				},
				{
					max: 50,
					increment: 1,
				},
			],
		};
	}

	if (
		sizeString === adSizes.leaderboard.toString() ||
		sizeString === adSizes.billboard.toString() ||
		sizeString === adSizes.mpu.toString()
	) {
		return {
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
					max: 50,
					increment: 1,
				},
			],
		};
	}

	return undefined;
};

export const otherPrebidPriceGranularity = (
	width: number,
	height: number,
): PrebidPriceGranularity | undefined => {
	const sizeString = [width, height].join(',');

	if (
		sizeString === adSizes.skyscraper.toString() ||
		sizeString === adSizes.halfPage.toString() ||
		sizeString === '320,480' // TODO find the name of this ad sizing
	) {
		return {
			buckets: [
				{
					max: 7,
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

	if (
		sizeString === adSizes.leaderboard.toString() ||
		sizeString === adSizes.billboard.toString() ||
		sizeString === adSizes.mpu.toString() ||
		sizeString === adSizes.mobilesticky.toString()
	) {
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

	return undefined;
};
