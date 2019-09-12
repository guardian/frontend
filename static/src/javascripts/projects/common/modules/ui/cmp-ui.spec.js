// @flow
import { consentManagementPlatformUi } from './cmp-ui';
import { cmpUi as cmpUi_ } from '../../../../../../../../consent-management-platform';
import { isInVariantSynchronous as isInVariantSynchronous_ } from 'common/modules/experiments/ab';

const cmpUi: any = cmpUi_;
const isInVariantSynchronous: any = isInVariantSynchronous_;

jest.mock('../../../../../../../../consent-management-platform', () => ({
    cmpUi: { canShow: jest.fn() },
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

describe('cmp-ui', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('consentManagementPlatformUi', () => {
        describe('canShow', () => {
            it('returns true if cmpUi.canShow true and in commercialIabCompliant test', () => {
                cmpUi.canShow.mockReturnValue(true);
                isInVariantSynchronous.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(true);
                });
            });

            it('returns false if cmpUi.canShow false', () => {
                cmpUi.canShow.mockReturnValue(false);
                isInVariantSynchronous.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });

            it('returns false if not in commercialIabCompliant test', () => {
                cmpUi.canShow.mockReturnValue(true);
                isInVariantSynchronous.mockReturnValue(false);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(show).toBe(false);
                });
            });
        });
    });
});
