// @flow
import { isCcpaApplicable as isCcpaApplicable_ } from 'projects/commercial/modules/cmp/ccpa-ab-test';
import {
    shouldShow,
    checkWillShowUi,
} from '@guardian/consent-management-platform';
import config from 'lib/config';
import { consentManagementPlatformUi } from './cmp-ui';

jest.mock('lib/raven');

jest.mock('@guardian/consent-management-platform', () => ({
    shouldShow: jest.fn(),
    checkWillShowUi: jest.fn(),
}));

jest.mock('lib/report-error', () => jest.fn());

const isCcpaApplicable: any = isCcpaApplicable_;
jest.mock('projects/commercial/modules/cmp/ccpa-ab-test', () => ({
    isCcpaApplicable: jest.fn(),
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

            it('returns checkWillShowUi if user is in CCPA variant', () => {
                config.set('switches.cmpUi', true);
                checkWillShowUi.mockReturnValue(Promise.resolve(true));
                isCcpaApplicable.mockReturnValue(true);

                return consentManagementPlatformUi.canShow().then(show => {
                    expect(checkWillShowUi).toHaveBeenCalledTimes(1);
                    expect(show).toBe(true);
                });
            });
        });
    });
});
