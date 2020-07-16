// @flow
import { isCcpaApplicable as isCcpaApplicable_ } from 'commercial/modules/cmp/ccpa-cmp';
import { oldCmp } from '@guardian/consent-management-platform';
import config from 'lib/config';
import { consentManagementPlatformUi } from './cmp-ui';

jest.mock('lib/raven');

jest.mock('@guardian/consent-management-platform', () => ({
    oldCmp: {
        shouldShow: jest.fn(),
        checkWillShowUi: jest.fn(),
    },
    onConsentChange: jest.fn()
}));

jest.mock('lib/report-error', () => jest.fn());

const isCcpaApplicable: any = isCcpaApplicable_;
jest.mock('projects/commercial/modules/cmp/ccpa-cmp', () => ({
    isCcpaApplicable: jest.fn(),
}));

jest.mock('commercial/modules/cmp/tcfv2-test', () => ({
    isInTcfv2Test: jest
        .fn()
        .mockImplementation(() => false),
}));

describe('cmp-ui', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('consentManagementPlatformUi', () => {
        describe('canShow', () => {
            it('return true if shouldShow returns true', () => {
                oldCmp.shouldShow.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });
            it('return false if shouldShow returns false', () => {
                oldCmp.shouldShow.mockReturnValue(false);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
            it('return false if cmpUi switch is off', () => {
                config.set('switches.cmpUi', false);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });

            it('returns checkWillShowUi if user is in CCPA variant', () => {
                config.set('switches.cmpUi', true);
                oldCmp.checkWillShowUi.mockReturnValue(Promise.resolve(true));
                isCcpaApplicable.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(oldCmp.checkWillShowUi).toHaveBeenCalledTimes(1);
                    expect(show).toBe(true);
                });
            });
        });
    });
});
