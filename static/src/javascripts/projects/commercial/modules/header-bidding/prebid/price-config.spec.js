// @flow

import { priceGranularity } from './price-config';

describe('priceGranularity', () => {
    test('should have correct number of buckets', () => {
        expect(priceGranularity.buckets.length).toBe(2);
    });
});
