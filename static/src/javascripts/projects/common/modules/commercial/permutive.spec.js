// @flow
import { local } from 'lib/storage';
import { getPermutiveSegments } from './permutive';

jest.mock('lib/storage', () => ({
    local: {
        getRaw: jest.fn(),
    },
}));

describe('getPermutiveSegments', () => {
    test('parses Permutive segments correctly', () => {
        local.getRaw.mockReturnValue(['[42,84,63]']);
        expect(getPermutiveSegments()).toEqual(['42', '84', '63']);
        local.getRaw.mockReturnValue([]);
        expect(getPermutiveSegments()).toEqual([]);
    });
    test('returns an empty array for bad inputs', () => {
        local.getRaw.mockReturnValue('-1');
        expect(getPermutiveSegments()).toEqual([]);
        local.getRaw.mockReturnValue('bad-string');
        expect(getPermutiveSegments()).toEqual([]);
        local.getRaw.mockReturnValue('{}');
        expect(getPermutiveSegments()).toEqual([]);
        local.getRaw.mockReturnValue('["not-a-number-segment"]');
        expect(getPermutiveSegments()).toEqual([]);
    });
});
