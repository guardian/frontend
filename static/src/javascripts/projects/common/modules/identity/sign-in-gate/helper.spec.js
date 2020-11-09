// @flow
import {
    hasUserDismissedGateInWindow,
    hasUserDismissedGateMoreThanCount,
    incrementUserDismissedGateCount,
    isCountry,
    isInvalidTag,
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

jest.mock('@guardian/libs', () => ({
    storage: {
        local: {
            get: jest.fn(() => undefined),
        },
    }
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInABTestSynchronous: jest.fn(() => true),
    getAsyncTestsToRun: jest.fn(() => Promise.resolve([])),
    getSynchronousTestsToRun: jest.fn(() => [
        {
            id: 'SignInGateMainVariant', // Update for each new test
            dataLinkNames: 'SignInGateMain', // Update for each new test
            variantToRun: {
                id: 'main-variant-2', // Update for each new test
            },
            ophanComponentId: 'main_test',
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
const fakeLocal: any = require('@guardian/libs').storage.local;
const fakeConfig: any = require('lib/config');

describe('Sign In Gate Helper functions', () => {
    describe('hasUserDismissedGateInWindow', () => {
        const moreThanADayAgo = new Date();
        moreThanADayAgo.setHours(moreThanADayAgo.getHours() - 26);
        const lessThanADayAgo = new Date();
        lessThanADayAgo.setHours(lessThanADayAgo.getHours() - 14);

        const test = {
            window: 'day',
            name: 'SignInGateMainVariant',
            variant: 'main-variant-2',
            componentName: 'sign-in-gate',
        };

        it('should return true if timestamp is less than specified window', () => {
            fakeUserPrefs.get.mockReturnValueOnce({
                'SignInGateMainVariant-main-variant-2': lessThanADayAgo.toISOString(),
            });

            expect(hasUserDismissedGateInWindow(test)).toBe(true); // todo
            expect(fakeUserPrefs.remove).toHaveBeenCalledTimes(0);
        });

        it('should clear local storage prefs and return false if timestamp from prefs is more than specified window', () => {
            fakeUserPrefs.get.mockReturnValueOnce({
                'SignInGateMainVariant-main-variant-2': moreThanADayAgo.toISOString(),
            });

            expect(hasUserDismissedGateInWindow(test)).toBe(false);
            expect(fakeUserPrefs.remove).toHaveBeenCalledTimes(1); // todo
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
            fakeLocal.get.mockReturnValueOnce('US');
            expect(isCountry('US')).toBe(true);
        });

        test('geolocation is not US', () => {
            fakeLocal.get.mockReturnValueOnce('GB');
            expect(isCountry('US')).toBe(false);
        });

        test('geolocation is false if not set', () => {
            expect(isCountry('US')).toBe(false);
        });
    });

    describe("isInvalidTag('tag')", () => {
        test("'info/newsletter-sign-up' article is invalid", () => {
            fakeConfig.get.mockReturnValueOnce("info/newsletter-sign-up,us-news/us-news,society/homelessness,society/housing");
            expect(isInvalidTag()).toBe(true);
        });

        test("non-Newsletters article is not invalid", () => {
            fakeConfig.get.mockReturnValueOnce("us-news/us-news,society/homelessness,society/housing");
            expect(isInvalidTag()).toBe(false);
        });
    });
});
