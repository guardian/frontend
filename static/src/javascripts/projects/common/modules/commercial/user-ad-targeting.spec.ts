
import { local } from "lib/storage";
import { getUserFromApi as getUserFromApi_, getUserFromCookie as getUserFromCookie_ } from "common/modules/identity/api";
import { getUserSegments, requestUserSegmentsFromId } from "common/modules/commercial/user-ad-targeting";

const getUserFromApi: any = getUserFromApi_;
const getUserFromCookie: any = getUserFromCookie_;

jest.mock('lib/storage');
jest.mock('common/modules/identity/api', () => ({
  getUserFromCookie: jest.fn(),
  getUserFromApi: jest.fn()
}));
const userSegmentsKey = 'gu.ads.userSegmentsData';

describe('User Ad Targeting', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getUserFromCookie.mockReturnValue({ id: 999900123 });
  });

  it('should exist', () => {
    expect(getUserSegments).toBeDefined();
    expect(requestUserSegmentsFromId).toBeDefined();
  });

  it('should only return segments when consent is true or null', () => {
    local.set(userSegmentsKey, {
      userHash: 123,
      segments: 'something'
    });
    expect(getUserSegments(null)).toBe('something');
    expect(getUserSegments(true)).toBe('something');
    expect(getUserSegments(false).length).toBe(0);
  });

  it('should return user segments data from local storage', () => {
    local.set(userSegmentsKey, {
      userHash: 123,
      segments: 'something'
    });
    expect(getUserSegments(true)).toBe('something');
  });

  it('should remove user segments belonging to another user from local storage', () => {
    local.set(userSegmentsKey, {
      userHash: 456,
      segments: 'anything'
    });
    expect(getUserSegments(true).length).toBe(0);
    expect(local.get(userSegmentsKey)).toBeFalsy();
  });

  it('should request user data from API and populate local storage', () => {
    getUserFromApi.mockImplementation(fn => fn({
      id: 999900789,
      adData: {
        a: 'b',
        c: 'd'
      }
    }));
    requestUserSegmentsFromId();
    expect(local.get(userSegmentsKey)).toMatchObject({
      segments: ['ab', 'cd'],
      userHash: 789
    });
  });
});