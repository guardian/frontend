// @flow
import { shouldShow } from '@guardian/consent-management-platform';
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
            it('returns true if shouldShow true and in CommercialCmpUiIab test variant', () => {
                shouldShow.mockReturnValue(true);
                isInVariantSynchronous.mockImplementation(
                    (test, variant) =>
                        test.id === 'CommercialCmpUiIab' &&
                        variant === 'variant'
                );

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });

            it('returns false if not in commercialCmpUiIab test', () => {
                shouldShow.mockReturnValue(true);
                isInVariantSynchronous.mockReturnValue(false);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });

            it('returns false if shouldShow false', () => {
                shouldShow.mockReturnValue(false);
                isInVariantSynchronous.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
        });
    });
});
