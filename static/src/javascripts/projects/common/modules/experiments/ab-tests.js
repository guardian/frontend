// @flow
import { isExpired } from 'common/modules/experiments/test-can-run-checks';
import { removeParticipation } from 'common/modules/experiments/utils';
import { getTest as getAcquisitionTest } from 'common/modules/experiments/acquisition-test-selector';
import { unrulyPerformanceTest } from 'common/modules/experiments/tests/unruly-performance';
import { commercialLazyLoading } from 'common/modules/experiments/tests/commercial-lazy-loading';
import { acquisitionsHeaderSubscribeMeansSubscribe } from 'common/modules/experiments/tests/acquisitions-header-subscribe-means-subscribe';
import { acquisitionsHeaderEURSupport } from 'common/modules/experiments/tests/acquisitions-header-eur-support';

export const TESTS: $ReadOnlyArray<ABTest> = [
    getAcquisitionTest(),
    unrulyPerformanceTest,
    acquisitionsHeaderSubscribeMeansSubscribe,
    acquisitionsHeaderEURSupport,
    commercialLazyLoading,
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
