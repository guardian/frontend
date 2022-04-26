import type { ABTest } from '@guardian/ab-core';
import { isInABTestSynchronous } from '../experiments/ab';
import { commercialGptLazyLoad } from '../experiments/tests/commercial-gpt-lazy-load';
import { commercialLazyLoadMargin } from '../experiments/tests/commercial-lazy-load-margin';
import { prebidPriceGranularity } from '../experiments/tests/prebid-price-granularity';
import { spacefinderOkrMegaTest } from '../experiments/tests/spacefinder-okr-mega-test';

const defaultClientSideTests: ABTest[] = [
	/* linter, please keep this array multi-line */
	spacefinderOkrMegaTest,
	commercialGptLazyLoad,
	commercialLazyLoadMargin,
	prebidPriceGranularity,
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
