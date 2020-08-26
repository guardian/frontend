// @flow
import { hasUserDismissedGateInWindow } from './helper';

jest.mock('bean', () => ({
    record: jest.fn(),
}));

jest.mock('common/modules/user-prefs', () => ({
    get: jest.fn(() => undefined),
    remove: jest.fn(),
}));

jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(() => [{ count: 2, day: 1 }]),
    },
}));

jest.mock('lib/config', () => ({
    get: jest.fn(() => false),
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
});
