// @flow

import Chance from 'chance';
import timing from './user-timing';

const chance = new Chance();
const mockIO = { entries: [] };
const mockedNowValue = chance.integer();

jest.mock('lib/window-performance', () => ({
    now: jest.fn(() => mockedNowValue),

    mark: jest.fn(name => {
        mockIO.entries.push({
            entryType: 'mark',
            name,
            startTime: mockedNowValue,
            duration: 0,
        });
    }),

    getEntriesByName: jest.fn((name, type) => {
        const item = mockIO.entries.find(
            mark => mark.entryType === type && mark.name === name
        );
        return [item];
    }),
}));

describe('user-timing', () => {
    test('getCurrentTime()', () => {
        expect(timing.getCurrentTime()).toBe(mockedNowValue);
    });

    test('mark()', () => {
        const name = chance.word();
        mockIO.entries = [];
        timing.mark(name);
        expect(mockIO.entries.length).toBe(1);
    });

    test('getTiming()', () => {
        const name = chance.word();
        timing.mark(name);
        const timer = timing.getTiming(name);
        expect(timer).toBe(mockedNowValue);
    });
});
