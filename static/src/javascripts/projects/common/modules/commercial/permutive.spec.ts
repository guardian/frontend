
import { storage } from "@guardian/libs";
import { getPermutiveSegments, getPermutivePFPSegments, _ } from "./permutive";

jest.mock('@guardian/libs', () => ({
  storage: {
    local: {
      getRaw: jest.fn()
    }
  }
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('getSegments', () => {
  const DUMMY_KEY = `_dummyKey`;
  test('parses Permutive segments correctly', () => {
    storage.local.getRaw.mockReturnValue(['[42,84,63]']);
    expect(_.getSegments(DUMMY_KEY)).toEqual(['42', '84', '63']);
    storage.local.getRaw.mockReturnValue([]);
    expect(_.getSegments(DUMMY_KEY)).toEqual([]);
  });
  test('returns an empty array for bad inputs', () => {
    storage.local.getRaw.mockReturnValue('-1');
    expect(_.getSegments(DUMMY_KEY)).toEqual([]);
    storage.local.getRaw.mockReturnValue('bad-string');
    expect(_.getSegments(DUMMY_KEY)).toEqual([]);
    storage.local.getRaw.mockReturnValue('{}');
    expect(_.getSegments(DUMMY_KEY)).toEqual([]);
    storage.local.getRaw.mockReturnValue('["not-a-number-segment"]');
    expect(_.getSegments(DUMMY_KEY)).toEqual([]);
  });
});

describe('getPermutiveSegments', () => {
  test('calls the right key from localStorage', () => {
    getPermutiveSegments();
    expect(storage.local.getRaw).toHaveBeenCalledWith(_.PERMUTIVE_KEY);
  });
});

describe('getPermutivePFPSegments', () => {
  test('calls the right key from localStorage', () => {
    getPermutivePFPSegments();
    expect(storage.local.getRaw).toHaveBeenCalledWith(_.PERMUTIVE_PFP_KEY);
  });
});