// @flow
import { optionalStringToNumber } from 'lib/string-utils';

describe('optionalStringToNumber', () => {
    it('should return a number', () => {
        expect(optionalStringToNumber('3')).toBe(3);
    });

    it('should return 0', () => {
        expect(optionalStringToNumber('0')).toBe(0);
    });

    it('should return undefined if undefined', () => {
        expect(optionalStringToNumber(undefined)).toBe(undefined);
    });

    it('should return undefined if NaN', () => {
        expect(optionalStringToNumber('')).toBe(undefined);
    });
});
