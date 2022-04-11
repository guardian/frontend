import { criteoPriceGranularity, priceGranularity } from './price-config';

describe('priceGranularity', () => {
	test('default should have correct number of buckets', () => {
		expect(priceGranularity.buckets.length).toBe(2);
	});

	test('criteo should have correct number of buckets', () => {
		expect(criteoPriceGranularity.buckets.length).toBe(3);
	});
});
