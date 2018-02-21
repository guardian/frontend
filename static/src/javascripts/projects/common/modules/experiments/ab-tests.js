// @flow
import { getTest as getAcquisitionTest } from 'common/modules/experiments/acquisition-test-selector';
import { isExpired } from 'common/modules/experiments/test-can-run-checks';
import { unrulyPerformanceTest } from 'common/modules/experiments/tests/unruly-performance';
import { commercialLazyLoading } from 'common/modules/experiments/tests/commercial-lazy-loading';
import { acquisitionsHeaderSubscribeMeansSubscribe } from 'common/modules/experiments/tests/acquisitions-header-subscribe-means-subscribe';

export const tests: $ReadOnlyArray<ABTest> = [
    getAcquisitionTest(),
    unrulyPerformanceTest,
    acquisitionsHeaderSubscribeMeansSubscribe,
    commercialLazyLoading,
].filter(Boolean);

export const activeTests = (): $ReadOnlyArray<ABTest> =>
    tests.filter(!isExpired);

export const expiredTests = (): $ReadOnlyArray<ABTest> =>
    tests.filter(isExpired);