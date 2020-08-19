// @flow
import config from 'lib/config';
import { cmp } from '@guardian/consent-management-platform';
import { consentManagementPlatformUi } from './cmp-ui';

jest.mock('lib/raven');

jest.mock('@guardian/consent-management-platform', () => ({
    cmp: {
        willShowPrivacyMessage: jest.fn(),
    },
    onConsentChange: jest.fn(),
}));

jest.mock('lib/report-error', () => jest.fn());

describe('cmp-ui', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('consentManagementPlatformUi', () => {
        describe('canShow', () => {
            it('return true if shouldShow returns true', () => {
                cmp.willShowPrivacyMessage.mockImplementation(() => true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });
            it('return false if shouldShow returns false', () => {
                cmp.willShowPrivacyMessage.mockImplementation(() => false);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });

            it('returns willShowPrivacyMessage if using Sourcepoint CMP', () =>
                consentManagementPlatformUi.canShow().then(() => {
                    expect(cmp.willShowPrivacyMessage).toHaveBeenCalledTimes(1);
                }));

            it('return false if CMP switch is off', () => {
                config.set('switches.cmp', false);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
        });
    });
});
