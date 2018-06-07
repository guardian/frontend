// @flow
import { isExpired } from 'common/modules/experiments/test-can-run-checks';
import { removeParticipation } from 'common/modules/experiments/utils';
import { getTest as getAcquisitionTest } from 'common/modules/experiments/acquisition-test-selector';
import { PoliticsWeeklyTreat } from 'common/modules/experiments/tests/politics-weekly-treat';
import { firstPvConsentBlocker } from './tests/first-pv-consent-blocker';
import { signInEngagementBannerDisplay } from './tests/sign-in-engagement-banner-display';

export const TESTS: $ReadOnlyArray<ABTest> = [
    getAcquisitionTest(),
    signInEngagementBannerDisplay,
    firstPvConsentBlocker,
    PoliticsWeeklyTreat,
].filter(Boolean);

export const getActiveTests = (): $ReadOnlyArray<ABTest> =>
    TESTS.filter(test => {
        if (isExpired(test.expiry)) {
            removeParticipation(test);
            return false;
        }
        return true;
    });

export const getExpiredTests = (): $ReadOnlyArray<ABTest> =>
    TESTS.filter(test => isExpired(test.expiry));

export const getTest = (id: string): ?ABTest => {
    const testIds = TESTS.map(test => test.id);
    const index = testIds.indexOf(id);
    return index > -1 ? TESTS[index] : null;
};
