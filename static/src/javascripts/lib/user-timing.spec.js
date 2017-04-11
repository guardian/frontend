// @flow

import Chance from 'chance';
import { mark, getTiming, getCurrentTime } from './user-timing';

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
            timingMark =>
                timingMark.entryType === type && timingMark.name === name
        );
        return [item];
    }),
}));

describe('user-timing', () => {
    test('getCurrentTime()', () => {
        expect(getCurrentTime()).toBe(mockedNowValue);
    });

    test('mark()', () => {
        const name = chance.word();
        mockIO.entries = [];
        mark(name);
        expect(mockIO.entries.length).toBe(1);
    });

    test('getTiming()', () => {
        const name = chance.word();
        mark(name);
        const timer = getTiming(name);
        expect(timer).toBe(mockedNowValue);
    });
});
