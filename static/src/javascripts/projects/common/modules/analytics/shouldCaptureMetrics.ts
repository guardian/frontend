import type { ABTest } from '@guardian/ab-core';
import { isInABTestSynchronous } from '../experiments/ab';
import { commercialEndOfQuarter2Test } from '../experiments/tests/commercial-end-of-quarter-2-test';
import { prebidPriceGranularity } from '../experiments/tests/prebid-price-granularity';

const defaultClientSideTests: ABTest[] = [
	/* linter, please keep this array multi-line */
	prebidPriceGranularity,
	commercialEndOfQuarter2Test,
];

const serverSideTests: ServerSideABTest[] = [];

/**
 * Function to check whether metrics should be captured for the current page
 * @param tests - optional array of ABTest to check against.
 * @returns {boolean} whether the user is in a one of a set of client or server-side tests
 * for which we want to always capture metrics.
 */
const shouldCaptureMetrics = (tests = defaultClientSideTests): boolean => {
	const userInClientSideTest = tests.some((test) =>
		isInABTestSynchronous(test),
	);

	const userInServerSideTest =
		window.guardian.config.tests !== undefined &&
		Object.keys(window.guardian.config.tests).some((test) =>
			String(serverSideTests).includes(test),
		);
	return userInClientSideTest || userInServerSideTest;
};

export { shouldCaptureMetrics };
