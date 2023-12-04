import type { ABTest } from '@guardian/ab-core';
import { getUrlVars } from 'lib/url';
import { isInABTestSynchronous } from '../experiments/ab';
import { integrateIma } from '../experiments/tests/integrate-ima';

const defaultClientSideTests: ABTest[] = [
	/* linter, please keep this array multi-line */
	integrateIma,
];

/**
 * Function to check whether metrics should be captured for the current page
 * @param tests - optional array of ABTest to check against.
 * @returns {boolean} whether the user is in one of a set of client or server-side tests
 * for which we want to always capture metrics or if we should force metrics.
 */
const shouldCaptureMetrics = (tests = defaultClientSideTests): boolean => {
	const userInClientSideTest = tests.some((test) =>
		isInABTestSynchronous(test),
	);

	const userInServerSideTest =
		Object.keys(window.guardian.config.tests ?? {}).length > 0;

	const forceSendMetrics = Boolean(getUrlVars().forceSendMetrics);

	return userInClientSideTest || userInServerSideTest || forceSendMetrics;
};

export { shouldCaptureMetrics };
