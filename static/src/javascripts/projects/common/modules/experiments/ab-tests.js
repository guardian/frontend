// @flow
import { isExpired } from 'common/modules/experiments/test-can-run-checks';
import { removeParticipation } from 'common/modules/experiments/utils';
import { getTest as getAcquisitionTest } from 'common/modules/experiments/acquisition-test-selector';
import { commercialLazyLoading } from 'common/modules/experiments/tests/commercial-lazy-loading';
import { acquisitionsHeaderSubscribeMeansSubscribe } from 'common/modules/experiments/tests/acquisitions-header-subscribe-means-subscribe';
import { acquisitionsHeaderAudSupport } from 'common/modules/experiments/tests/acquisitions-header-aud-support';
import { acquisitionsHeaderRowSupport } from 'common/modules/experiments/tests/acquisitions-header-row-support';
import { spacefinderSimplify } from 'common/modules/experiments/tests/spacefinder-simplify';

export const TESTS: $ReadOnlyArray<ABTest> = [
    getAcquisitionTest(),
    acquisitionsHeaderSubscribeMeansSubscribe,
    acquisitionsHeaderAudSupport,
    acquisitionsHeaderRowSupport,
    commercialLazyLoading,
    spacefinderSimplify,
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

// UnrulyPerformanceTest
export const getTest = (id: string): ?ABTest => {
    const testIds = TESTS.map(test => test.id);
    const index = testIds.indexOf(id);
    return index > -1 ? TESTS[index] : null;
};
