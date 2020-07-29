// @flow
import config from 'lib/config';
import { cmp, oldCmp } from '@guardian/consent-management-platform';
import { shouldUseSourcepointCmp } from 'commercial/modules/cmp/sourcepoint';
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

jest.mock('commercial/modules/cmp/sourcepoint', () => ({
    shouldUseSourcepointCmp: jest.fn(),
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

            it('returns willShowPrivacyMessage if using Sourcepoint CMP', () => {
                // $FlowFixMe
                shouldUseSourcepointCmp.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(() => {
                    expect(cmp.willShowPrivacyMessage).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
