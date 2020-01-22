// @flow
import { local } from 'lib/storage';
import { getPermutiveSegments, getPermutivePFPSegments, _ } from './permutive';

jest.mock('lib/storage', () => ({
    local: {
        getRaw: jest.fn(),
    },
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe('getSegments', () => {
    const DUMMY_KEY = `_dummyKey`;
    test('parses Permutive segments correctly', () => {
        local.getRaw.mockReturnValue(['[42,84,63]']);
        expect(_.getSegments(DUMMY_KEY)).toEqual(['42', '84', '63']);
        local.getRaw.mockReturnValue([]);
        expect(_.getSegments(DUMMY_KEY)).toEqual([]);
    });
    test('returns an empty array for bad inputs', () => {
        local.getRaw.mockReturnValue('-1');
        expect(_.getSegments(DUMMY_KEY)).toEqual([]);
        local.getRaw.mockReturnValue('bad-string');
        expect(_.getSegments(DUMMY_KEY)).toEqual([]);
        local.getRaw.mockReturnValue('{}');
        expect(_.getSegments(DUMMY_KEY)).toEqual([]);
        local.getRaw.mockReturnValue('["not-a-number-segment"]');
        expect(_.getSegments(DUMMY_KEY)).toEqual([]);
    });
});

describe('getPermutiveSegments', () => {
    test('calls the right key from localStorage', () => {
        getPermutiveSegments();
        expect(local.getRaw).toHaveBeenCalledWith(_.PERMUTIVE_KEY);
    });
});

describe('getPermutivePFPSegments', () => {
    test('calls the right key from localStorage', () => {
        getPermutivePFPSegments();
        expect(local.getRaw).toHaveBeenCalledWith(_.PERMUTIVE_PFP_KEY);
    });
});
