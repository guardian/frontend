// @flow
import config from 'lib/config';
import { cmp } from '@guardian/consent-management-platform';
import { cmpBannerCandidate } from './cmp-ui';

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

    describe('cmpBannerCandidate', () => {
        describe('canShow', () => {
            it('return true if cmp.willShowPrivacyMessage() returns true', () => {
                cmp.willShowPrivacyMessage.mockImplementation(() => true);

                return cmpBannerCandidate.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });
            it('return false if cmp.willShowPrivacyMessage() returns false', () => {
                cmp.willShowPrivacyMessage.mockImplementation(() => false);

                return cmpBannerCandidate.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });

            it('returns willShowPrivacyMessage if using Sourcepoint CMP', () =>
                cmpBannerCandidate.canShow().then(() => {
                    expect(cmp.willShowPrivacyMessage).toHaveBeenCalledTimes(1);
                }));

            it('return false if CMP switch is off', () => {
                config.set('switches.cmp', false);

                return cmpBannerCandidate.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
        });
    });
});
