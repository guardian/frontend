// @flow
import { local } from 'lib/storage';
import {
    getUserFromApi as getUserFromApi_,
    getUserFromCookie as getUserFromCookie_,
} from 'common/modules/identity/api';
import {
    getUserSegments,
    requestUserSegmentsFromId,
} from 'common/modules/commercial/user-ad-targeting';
import { consentState as consentState_ } from 'lib/cmp';

const getUserFromApi: any = getUserFromApi_;
const getUserFromCookie: any = getUserFromCookie_;
const consentState: any = consentState_;

jest.mock('lib/storage');
jest.mock('common/modules/identity/api', () => ({
    getUserFromCookie: jest.fn(),
    getUserFromApi: jest.fn(),
}));

jest.mock('lib/cmp', () => ({
    consentState: jest.fn(),
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

    it('should return an empty array if consent is false even if segments are set', () => {
        local.set(userSegmentsKey, {
            userHash: 123,
            segments: 'something',
        });
        expect(getUserSegments(false).length).toBe(0);
    });

    it('should return user segments data from local storage when consent is true', () => {
        consentState.mockImplementation(() => true);
        local.set(userSegmentsKey, {
            userHash: 123,
            segments: 'something',
        });
        expect(getUserSegments(true)).toBe('something');
    });

    it('should return user segments data from local storage when consent is null', () => {
        consentState.mockImplementation(() => null);
        local.set(userSegmentsKey, {
            userHash: 123,
            segments: 'something',
        });
        expect(getUserSegments(null)).toBe('something');
    });

    it('should remove user segments belonging to another user from local storage', () => {
        consentState.mockImplementation(() => true);
        local.set(userSegmentsKey, {
            userHash: 456,
            segments: 'anything',
        });
        expect(getUserSegments(true).length).toBe(0);
        expect(local.get(userSegmentsKey)).toBeFalsy();
    });

    it('should request user data from API and populate local storage', () => {
        consentState.mockImplementation(() => true);
        getUserFromApi.mockImplementation(fn =>
            fn({
                id: 999900789,
                adData: {
                    a: 'b',
                    c: 'd',
                },
            })
        );
        requestUserSegmentsFromId();
        expect(local.get(userSegmentsKey)).toMatchObject({
            segments: ['ab', 'cd'],
            userHash: 789,
        });
    });
});
