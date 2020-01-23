// @flow
import { shouldShow } from '@guardian/consent-management-platform';
import config from 'lib/config';
import { isInVariantSynchronous as isInVariantSynchronous_ } from 'common/modules/experiments/ab';
import { consentManagementPlatformUi } from './cmp-ui';

const isInVariantSynchronous: any = isInVariantSynchronous_;

jest.mock('lib/raven');

jest.mock('@guardian/consent-management-platform', () => ({
    shouldShow: jest.fn(),
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

jest.mock('lib/report-error', () => jest.fn());

describe('cmp-ui', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('consentManagementPlatformUi', () => {
        describe('canShow', () => {
            it('returns false if in CommercialCmpUiBannerModal control group', () => {
                isInVariantSynchronous.mockImplementation(
                    (test, variant) =>
                        test.id === 'CommercialCmpUiBannerModal' &&
                        variant === 'control'
                );

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
            it('returns true if in CommercialCmpUiBannerModal variant group and shouldShow returns true', () => {
                shouldShow.mockReturnValue(true);
                isInVariantSynchronous.mockImplementation(
                    (test, variant) =>
                        test.id === 'CommercialCmpUiBannerModal' &&
                        variant === 'variant'
                );

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });
            it('returns false if in CommercialCmpUiBannerModal variant group and shouldShow returns false', () => {
                shouldShow.mockReturnValue(false);
                isInVariantSynchronous.mockImplementation(
                    (test, variant) =>
                        test.id === 'CommercialCmpUiBannerModal' &&
                        variant === 'variant'
                );

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
            it('return true if not in CommercialCmpUiBannerModal test and shouldShow returns true', () => {
                shouldShow.mockReturnValue(true);
                isInVariantSynchronous.mockImplementation(
                    test => test.id !== 'CommercialCmpUiBannerModal'
                );

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });
            it('return false if not in CommercialCmpUiBannerModal test and shouldShow returns false', () => {
                shouldShow.mockReturnValue(false);
                isInVariantSynchronous.mockImplementation(
                    test => test.id !== 'CommercialCmpUiBannerModal'
                );

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
            it('return false if not in CommercialCmpUiBannerModal test and cmpUi switch is off', () => {
                config.set('switches.cmpUi', false);
                isInVariantSynchronous.mockImplementation(
                    test => test.id !== 'CommercialCmpUiBannerModal'
                );

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
        });
    });
});
