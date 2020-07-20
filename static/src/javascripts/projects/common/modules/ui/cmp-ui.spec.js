// @flow
import config from 'lib/config';
import { cmp, oldCmp } from '@guardian/consent-management-platform';
import { isInUsa } from 'common/modules/commercial/geo-utils';
import { isInTcfv2Test } from 'commercial/modules/cmp/tcfv2-test';
import { consentManagementPlatformUi } from './cmp-ui';

jest.mock('lib/raven');

jest.mock('@guardian/consent-management-platform', () => ({
    oldCmp: {
        shouldShow: jest.fn(),
        checkWillShowUi: jest.fn(),
    },
    cmp: {
        willShowPrivacyMessage: jest.fn(),
    },
    onConsentChange: jest.fn(),
}));

jest.mock('lib/report-error', () => jest.fn());

jest.mock('common/modules/commercial/geo-utils', () => ({
    isInUsa: jest.fn(),
}));

jest.mock('commercial/modules/cmp/tcfv2-test', () => ({
    isInTcfv2Test: jest.fn(),
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

            it('returns willShowPrivacyMessage if user is in CCPA/TCFv2 variant', () => {
                isInUsa.mockReturnValue(true);
                isInTcfv2Test.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(cmp.willShowPrivacyMessage).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
