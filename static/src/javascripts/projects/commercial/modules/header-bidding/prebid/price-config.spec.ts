import {
	criteoPriceGranularity,
	indexPriceGranularity,
	ozonePriceGranularity,
	priceGranularity,
} from './price-config';

describe('price granularity', () => {
	test('default should have correct buckets', () => {
		expect(priceGranularity).toEqual({
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
					max: 100,
					increment: 1,
				},
			],
		});
	});
	test('criteo should have correct buckets', () => {
		expect(criteoPriceGranularity).toEqual({
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
		});
	});

	describe('ozone', () => {
		const ozoneGranularityOption1 = {
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

		const ozoneGranularityOption2 = {
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

		test.each([
			[[100, 100], undefined],
			[[160, 600], ozoneGranularityOption1],
			[[300, 600], ozoneGranularityOption1],
			[[728, 90], ozoneGranularityOption2],
			[[970, 250], ozoneGranularityOption2],
			[[300, 250], ozoneGranularityOption2],
			[[620, 350], ozoneGranularityOption2],
			[[300, 197], ozoneGranularityOption2],
		])(
			'Ozone slot with size %s gives correct granularity',
			([width, height], expectedGranularity) => {
				expect(ozonePriceGranularity(width, height)).toEqual(
					expectedGranularity,
				);
			},
		);
	});

	describe('Index Prebid', () => {
		const indexPrebidGranularityOption1 = {
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

		const indexPrebidGranularityOption2 = {
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

		test.each([
			[[100, 100], undefined],
			[[160, 600], indexPrebidGranularityOption1],
			[[300, 600], indexPrebidGranularityOption1],
			[[728, 90], indexPrebidGranularityOption2],
			[[970, 250], indexPrebidGranularityOption2],
			[[300, 250], indexPrebidGranularityOption2],
		])(
			'Index Prebid slot with size %s gives correct granularity',
			([width, height], expectedGranularity) => {
				expect(indexPriceGranularity(width, height)).toEqual(
					expectedGranularity,
				);
			},
		);
	});
});
