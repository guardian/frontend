// @flow
import { daysSince } from 'lib/time-utils';

describe('Days since', () => {
    it('should return a correct duration give a valid date string', () => {
        const DATE_TO_USE = new Date('2017-06-09T15:00:00Z');
        const RealDate = Date;
        global.Date = jest.fn(() => DATE_TO_USE);
        global.Date.parse = RealDate.parse;

        const correctDateString = '2017-06-08T15:00:00Z';
        expect(daysSince(correctDateString)).toBe(1);
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
