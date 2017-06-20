// @flow
import { daysSince } from 'lib/time-utils';

describe('Days since', () => {
    it('should return a correct duration give a valid date string', () => {
        const mockDate = new Date('2017-06-09T15:00:00Z');
        const originalDate = global.Date;
        const correctDateString = '2017-06-08T15:00:00Z';
        const correctDateTime = 1496934000000;

        global.Date = jest.fn(() => mockDate);
        global.Date.parse = jest.fn(() => correctDateTime);

        expect(daysSince(correctDateString)).toBe(1);

        global.Date = originalDate;
        global.Date.parse = originalDate.parse;
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
