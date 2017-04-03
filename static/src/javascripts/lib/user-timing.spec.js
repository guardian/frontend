// @flow

import Chance from 'chance';
import timing from './user-timing';

const chance = new Chance();
const mockIO = { marks: [] };

jest.mock('lib/window-performance', () => ({
    now: jest.fn(() => 100),

    mark: jest.fn(name => {
        mockIO.marks.push({
            entryType: 'mark',
            name,
            startTime: 100,
            duration: 0,
        });
    }),

    getEntriesByName: jest.fn((name, type) => {
        const item = mockIO.marks.find(
            mark => mark.entryType === type && mark.name === name
        );
        return [item];
    }),
}));

describe('user-timing', () => {
    test('getCurrentTime()', () => {
        expect(timing.getCurrentTime()).toBe(100);
    });

    test('mark()', () => {
        const name = chance.word();
        mockIO.marks = [];
        timing.mark(name);
        expect(mockIO.marks.length).toBe(1);
    });

    test('getTiming()', () => {
        const name = chance.word();
        timing.mark(name);
        const timer = timing.getTiming(name);
        expect(timer).toBe(100);
    });
});
