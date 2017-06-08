// @flow
import { daysSince } from 'lib/time-utils';

describe('Days since', () => {
    it('should return a correct duration give a valid date string', () => {
        const correctDateString = '2017-06-08T15:26:14Z';
        expect(daysSince(correctDateString)).not.toBe(Infinity);
    });

    it('should return infinity for an incorrect give a invalid date string', () => {
        const incorrectDateString = 'blah';
        expect(daysSince(incorrectDateString)).toBe(Infinity);
    });

    it('should return infinity for an null value', () => {
        const incorrectDateString = null;
        expect(daysSince(incorrectDateString)).toBe(Infinity);
    });
});
