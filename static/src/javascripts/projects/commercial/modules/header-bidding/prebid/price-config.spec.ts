import { criteoPriceGranularity, priceGranularity } from './price-config';

describe('priceGranularity', () => {
	test('default should have correct number of buckets', () => {
		expect(priceGranularity).toEqual({
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
		});
	});

	test('criteo should have correct number of buckets', () => {
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
});
