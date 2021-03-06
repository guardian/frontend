/**
 * DO NOT EDIT THIS FILE
 *
 * It is not used to to build anything.
 *
 * It's just a record of the old flow types.
 *
 * Use it as a guide when converting
 * - static/src/javascripts/lib/user-timing.spec.js
 * to .ts, then delete it.
 */

// @flow

import Chance from 'chance';
import { markTime, getMarkTime, getCurrentTime } from './user-timing';

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

    test('markTime()', () => {
        const name = chance.word();
        mockIO.entries = [];
        markTime(name);
        expect(mockIO.entries.length).toBe(1);
    });

    test('getMarkTime()', () => {
        const name = chance.word();
        markTime(name);
        const timer = getMarkTime(name);
        expect(timer).toBe(mockedNowValue);
    });
});
