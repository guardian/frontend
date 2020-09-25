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
            it('return true if cmp.willShowPrivacyMessage() resolves to true', () => {
                cmp.willShowPrivacyMessage.mockResolvedValue(true);

                return cmpBannerCandidate.canShow().then(show => {
                    expect(cmp.willShowPrivacyMessage).toHaveBeenCalledTimes(1);
                    expect(show).toBe(true);
                });
            });
            it('return false if cmp.willShowPrivacyMessage() resolves to false', () => {
                cmp.willShowPrivacyMessage.mockResolvedValue(false);

                return cmpBannerCandidate.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
            it('return false if CMP switch is off', () => {
                config.set('switches.cmp', false);

                return cmpBannerCandidate.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
        });
    });
});
