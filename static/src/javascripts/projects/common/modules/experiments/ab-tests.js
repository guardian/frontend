// @flow
import { isExpired } from 'common/modules/experiments/test-can-run-checks';
import { removeParticipation } from 'common/modules/experiments/utils';
import { getTest as getAcquisitionTest } from 'common/modules/experiments/acquisition-test-selector';
import { outstreamFrequencyCapHoldback } from 'common/modules/experiments/tests/outstream-cap-holdback';
import { acquisitionsEpicElectionInteractiveEnd } from 'common/modules/experiments/tests/acquisitions-epic-election-interactive-end';
import { unrulyPerformanceTest } from 'common/modules/experiments/tests/unruly-performance';
import { prebidIntegration } from 'common/modules/experiments/tests/prebid-integration';
import { commercialStackFreeze } from 'common/modules/experiments/tests/commercial-stack-freeze';

export const TESTS: $ReadOnlyArray<ABTest> = [
    getAcquisitionTest(),
    acquisitionsEpicElectionInteractiveEnd,
    outstreamFrequencyCapHoldback,
    unrulyPerformanceTest,
    prebidIntegration,
    commercialStackFreeze,
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
