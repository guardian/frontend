// @flow
import { getSync as getSync_ } from 'lib/geolocation';
import {
    isExcludedGeolocation,
    stripMobileSuffix,
    stripTrailingNumbersAbove1,
} from './utils';

const getSync: any = getSync_;

jest.mock('lib/geolocation', () => ({
    getSync: jest.fn(() => 'GB'),
}));

describe('Utils', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('isExcludedGeolocation should return true for excluded geolocations', () => {
        const excludedGeos = ['US', 'CA', 'NZ', 'AU'];
        for (let i = 0; i < excludedGeos.length; i += 1) {
            getSync.mockReturnValueOnce(excludedGeos[i]);
            expect(isExcludedGeolocation()).toBe(true);
        }
    });

    test('isExcludedGeolocation should otherwise return false', () => {
        expect(isExcludedGeolocation()).toBe(false);
    });

    test('stripMobileSuffix', () => {
        expect(stripMobileSuffix('top-above-nav--mobile')).toBe(
            'top-above-nav'
        );
        expect(stripMobileSuffix('inline1--mobile')).toBe('inline1');
    });

    test('stripTrailingNumbersAbove1', () => {
        expect(stripTrailingNumbersAbove1('inline1')).toBe('inline1');
        expect(stripTrailingNumbersAbove1('inline2')).toBe('inline');
        expect(stripTrailingNumbersAbove1('inline10')).toBe('inline');
        expect(stripTrailingNumbersAbove1('inline23')).toBe('inline');
        expect(stripTrailingNumbersAbove1('inline101')).toBe('inline');
        expect(stripTrailingNumbersAbove1('inline456')).toBe('inline');
    });
});
