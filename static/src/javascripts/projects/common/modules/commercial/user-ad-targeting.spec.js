// @flow
import { local } from 'lib/storage';
import { getUserFromCookie as getUserFromCookie_ } from 'common/modules/identity/api';
import { getUserSegments } from 'common/modules/commercial/user-ad-targeting';

const getUserFromCookie: any = getUserFromCookie_;

jest.mock('lib/storage');
jest.mock('common/modules/identity/api', () => ({
    getUserFromCookie: jest.fn(),
}));
const userSegmentsKey = 'gu.ads.userSegmentsData';

describe('User Ad Targeting', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        getUserFromCookie.mockReturnValue({ id: 999900123 });
    });

    it('should exist', () => {
        expect(getUserSegments).toBeDefined();
    });

    it('should return user segments data from local storage', () => {
        local.set(userSegmentsKey, {
            userHash: 123,
            segments: 'something',
        });
        expect(getUserSegments()).toBe('something');
    });

    it('should remove user segments belonging to another user from local storage', () => {
        local.set(userSegmentsKey, {
            userHash: 456,
            segments: 'anything',
        });
        expect(getUserSegments().length).toBe(0);
        expect(local.get(userSegmentsKey)).toBeFalsy();
    });
});
