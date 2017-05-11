// @flow
import { TESTS } from './ab-tests';

describe('Start and Expiry dates', () => {
    test('Start and Expiry dates should be in exact ISO 8601 format for consistent parsing across browsers', () => {
        TESTS.forEach(test => {
            expect(test.start).toMatch('\\d{4}-\\d{2}-\\d{2}');
            expect(test.expiry).toMatch('\\d{4}-\\d{2}-\\d{2}');
        });
    });
});
