// @flow
import {
    hasUserDismissedGateInWindow,
    hasUserDismissedGateMoreThanCount,
    incrementUserDismissedGateCount,
    isCountry,
} from './helper';

jest.mock('bean', () => ({
    record: jest.fn(),
}));

jest.mock('common/modules/user-prefs', () => ({
    get: jest.fn(() => undefined),
    set: jest.fn(() => undefined),
    remove: jest.fn(),
}));

jest.mock('lib/config', () => ({
    get: jest.fn(() => false),
}));

jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(() => [{}]),
    },
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInABTestSynchronous: jest.fn(() => true),
    getAsyncTestsToRun: jest.fn(() => Promise.resolve([])),
    getSynchronousTestsToRun: jest.fn(() => [
        {
            id: 'SignInGatePatientia', // Update for each new test
            dataLinkNames: 'SignInGatePatientia', // Update for each new test
            variantToRun: {
                id: 'patientia-variant-1', // Update for each new test
            },
            ophanComponentId: 'patientia_test',
        },
    ]),
}));

jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(() => false),
}));

jest.mock('common/modules/ui/cmp-ui', () => ({
    get: jest.fn(() => undefined),
}));

jest.mock('@guardian/consent-management-platform', () => ({
    get: jest.fn(() => undefined),
}));

jest.mock('./component-event-tracking', () => ({
    get: jest.fn(() => undefined),
}));

const fakeUserPrefs: any = require('common/modules/user-prefs');
const fakeLocal: any = require('lib/storage').local;

describe('Sign In Gate Helper functions', () => {
    describe('hasUserDismissedGateInWindow', () => {
        const moreThanADayAgo = new Date();
        moreThanADayAgo.setHours(moreThanADayAgo.getHours() - 26);
        const lessThanADayAgo = new Date();
        lessThanADayAgo.setHours(lessThanADayAgo.getHours() - 14);

        const test = {
            window: 'day',
            name: 'SignInGatePatientia',
            variant: 'patientia-variant-1',
            componentName: 'sign-in-gate',
        };

        it('should return true if timestamp is less than specified window', () => {
            fakeUserPrefs.get.mockReturnValueOnce({
                'SignInGatePatientia-patientia-variant-1': lessThanADayAgo.toISOString(),
            });

            expect(hasUserDismissedGateInWindow(test)).toBe(true);
            expect(fakeUserPrefs.remove).toHaveBeenCalledTimes(0);
        });

        it('should clear local storage prefs and return false if timestamp from prefs is more than specified window', () => {
            fakeUserPrefs.get.mockReturnValueOnce({
                'SignInGatePatientia-patientia-variant-1': moreThanADayAgo.toISOString(),
            });

            expect(hasUserDismissedGateInWindow(test)).toBe(false);
            expect(fakeUserPrefs.remove).toHaveBeenCalledTimes(1);
        });
    });

    describe('hasUserDismissedGateMoreThanCount', () => {
        let userPrefs = {};

        beforeEach(() => {
            userPrefs = {};
            fakeUserPrefs.get.mockImplementation(k => userPrefs[k]);
            fakeUserPrefs.set.mockImplementation((k, v) => {
                userPrefs[k] = v;
            });
        });

        afterEach(() => {
            fakeUserPrefs.get.mockRestore();
            fakeUserPrefs.set.mockRestore();
        });

        it('should depend on the counter incremented by incrementUserDismissedGateCount', () => {
            expect(
                hasUserDismissedGateMoreThanCount(
                    'variant-1',
                    'test-1',
                    'sign-in-gate',
                    0
                )
            ).toBe(false);

            incrementUserDismissedGateCount(
                'variant-1',
                'test-1',
                'sign-in-gate'
            );
            expect(
                hasUserDismissedGateMoreThanCount(
                    'variant-1',
                    'test-1',
                    'sign-in-gate',
                    0
                )
            ).toBe(true);
            expect(
                hasUserDismissedGateMoreThanCount(
                    'variant-1',
                    'test-1',
                    'sign-in-gate',
                    1
                )
            ).toBe(false);

            incrementUserDismissedGateCount(
                'variant-1',
                'test-1',
                'sign-in-gate'
            );
            expect(
                hasUserDismissedGateMoreThanCount(
                    'variant-1',
                    'test-1',
                    'sign-in-gate',
                    1
                )
            ).toBe(true);
            expect(
                hasUserDismissedGateMoreThanCount(
                    'variant-1',
                    'test-1',
                    'sign-in-gate',
                    2
                )
            ).toBe(false);

            expect(
                hasUserDismissedGateMoreThanCount(
                    'variant-2',
                    'test-1',
                    'sign-in-gate',
                    0
                )
            ).toBe(false);
        });

        it('should not be affected by incrementing other variants or tests', () => {
            incrementUserDismissedGateCount(
                'variant-1',
                'test-1',
                'sign-in-gate'
            );
            expect(
                hasUserDismissedGateMoreThanCount(
                    'variant-2',
                    'test-1',
                    'sign-in-gate',
                    0
                )
            ).toBe(false);
            expect(
                hasUserDismissedGateMoreThanCount(
                    'variant-1',
                    'test-2',
                    'sign-in-gate',
                    0
                )
            ).toBe(false);
        });
    });

    describe("isCountry('countryCode')", () => {
        test('geolocation is US', () => {
            fakeLocal.get.mockReturnValueOnce({
                value: 'US',
            });
            expect(isCountry('US')).toBe(true);
        });

        test('geolocation is not US', () => {
            fakeLocal.get.mockReturnValueOnce({
                value: 'GB',
            });
            expect(isCountry('US')).toBe(false);
        });

        test('geolocation is false if not set', () => {
            expect(isCountry('US')).toBe(false);
        });
    });
});
