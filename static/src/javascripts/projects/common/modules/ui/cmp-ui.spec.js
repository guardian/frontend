// @flow
import { isInVariantSynchronous as isInVariantSynchronous_ } from 'common/modules/experiments/ab';
import { shouldShow } from '@guardian/consent-management-platform';
import config from 'lib/config';
import { consentManagementPlatformUi } from './cmp-ui';

jest.mock('lib/raven');

jest.mock('@guardian/consent-management-platform', () => ({
    shouldShow: jest.fn(),
}));

jest.mock('lib/report-error', () => jest.fn());

const isInVariantSynchronous: any = isInVariantSynchronous_;
jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

describe('cmp-ui', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('consentManagementPlatformUi', () => {
        describe('canShow', () => {
            it('return true if shouldShow returns true', () => {
                shouldShow.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });
            it('return false if shouldShow returns false', () => {
                shouldShow.mockReturnValue(false);

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

            it('return false if user is in CCPA variant', () => {
                config.set('switches.cmpUi', true);
                shouldShow.mockReturnValue(true);
                isInVariantSynchronous.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
        });
    });
});
