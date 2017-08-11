// @flow
import { isExpired } from 'common/modules/experiments/test-can-run-checks';
import { removeParticipation } from 'common/modules/experiments/utils';
import { getTest as getAcquisitionTest } from 'common/modules/experiments/acquisition-test-selector';
import { membershipEngagementBannerTests } from 'common/modules/experiments/tests/membership-engagement-banner-tests';
import { paidContentVsOutbrain2 } from 'common/modules/experiments/tests/paid-content-vs-outbrain';
import { carrotSlot } from 'common/modules/experiments/tests/carrot-slot';
import { tailorSurvey } from 'common/modules/experiments/tests/tailor-survey';

import { acquisitionsEpicElectionInteractiveEnd } from 'common/modules/experiments/tests/acquisitions-epic-election-interactive-end';
import { acquisitionsEpicElectionInteractiveSlice } from 'common/modules/experiments/tests/acquisitions-epic-election-interactive-slice';

export const TESTS: Array<ABTest> = [
    paidContentVsOutbrain2,
    getAcquisitionTest(),
    tailorSurvey,
    carrotSlot,
    acquisitionsEpicElectionInteractiveEnd,
    acquisitionsEpicElectionInteractiveSlice,
]
    .concat(membershipEngagementBannerTests)
    .filter(Boolean);

export const getActiveTests = (): Array<ABTest> =>
    TESTS.filter(test => {
        if (isExpired(test.expiry)) {
            removeParticipation(test);
            return false;
        }
        return true;
    });

export const getExpiredTests = (): Array<ABTest> =>
    TESTS.filter(test => isExpired(test.expiry));

export const getTest = (id: string): ?ABTest => {
    const testIds = TESTS.map(test => test.id);
    const index = testIds.indexOf(id);
    return index > -1 ? TESTS[index] : null;
};
