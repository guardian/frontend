// @flow
import { signInGate } from './index';

jest.mock('ophan/ng', () => ({
    record: jest.fn(),
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInABTestSynchronous: jest.fn(() => true),
    getAsyncTestsToRun: jest.fn(() => Promise.resolve([])),
    getSynchronousTestsToRun: jest.fn(() => [
        {
            id: 'SignInGateQuartus',
            variantToRun: {
                id: 'variant',
            },
        },
    ]),
}));

jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(() => [{ count: 1, day: 1 }]),
    },
}));

jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(() => false),
}));

jest.mock('lib/config', () => ({
    get: jest.fn(() => false),
}));

jest.mock('common/modules/user-prefs', () => ({
    get: jest.fn(() => undefined),
}));

jest.mock('lib/cookies', () => ({
    getCookie: jest.fn(() => ''),
}));

const fakeIsInABTestSynchronous: any = require('common/modules/experiments/ab')
    .isInABTestSynchronous;

const fakeLocal: any = require('lib/storage').local;

const fakeIsUserLoggedIn: any = require('common/modules/identity/api')
    .isUserLoggedIn;

const fakeConfig: any = require('lib/config');

const fakeUserPrefs: any = require('common/modules/user-prefs');

describe('Sign in gate test', () => {
    describe('canShow returns true', () => {
        it('should return true using default mocks', () =>
            signInGate.canShow().then(show => {
                expect(show).toBe(true);
            }));

        it('should return true if page view is greater than or equal to 1', () => {
            fakeLocal.get.mockReturnValueOnce([{ count: 10, day: 1 }]);
            signInGate.canShow().then(show => {
                expect(show).toBe(true);
            });
        });
    });

    describe('canShow returns false', () => {
        it('should return false if not in correct test', () => {
            fakeIsInABTestSynchronous.mockReturnValueOnce(false);
            return signInGate.canShow().then(show => {
                expect(show).toBe(false);
            });
        });

        it('should return false if this is the first page view', () => {
            fakeLocal.get.mockReturnValueOnce([{ count: 0, day: 1 }]);
            return signInGate.canShow().then(show => {
                expect(show).toBe(false);
            });
        });

        it('should return false of the dailyArticleCount does not exist', () => {
            fakeLocal.get.mockReturnValueOnce(undefined);
            return signInGate.canShow().then(show => {
                expect(show).toBe(false);
            });
        });

        it('should return false if user has dismissed the gate', () => {
            fakeUserPrefs.get.mockReturnValueOnce({
                'SignInGateQuartus-variant': Date.now(),
            });
        });

        it('should return false if the user is logged in', () => {
            fakeIsUserLoggedIn.mockReturnValueOnce(true);
            return signInGate.canShow().then(show => {
                expect(show).toBe(false);
            });
        });

        it('should return false if there is an invalid article type or section detected', () => {
            fakeConfig.get.mockReturnValueOnce(true);
            return signInGate.canShow().then(show => {
                expect(show).toBe(false);
            });
        });
    });
});
