import type { ABTest } from '@guardian/ab-core';
import { getUrlVars } from 'lib/url';
import { isInABTestSynchronous } from '../experiments/ab';
import { removePrebidA9Canada } from '../experiments/tests/removePrebidA9Canada';

const defaultClientSideTests: ABTest[] = [
	/* linter, please keep this array multi-line */
	removePrebidA9Canada,
];

const serverSideTests: ServerSideABTest[] = [
	/* linter, please keep this array multi-line */
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
		window.guardian.config.tests !== undefined &&
		Object.keys(window.guardian.config.tests).some((test) =>
			String(serverSideTests).includes(test),
		);

	const forceSendMetrics = Boolean(getUrlVars().forceSendMetrics);

	return userInClientSideTest || userInServerSideTest || forceSendMetrics;
};

export { shouldCaptureMetrics };
