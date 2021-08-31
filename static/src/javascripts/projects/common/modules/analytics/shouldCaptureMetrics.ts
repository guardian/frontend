import type { ABTest } from '@guardian/ab-core';
import { getSynchronousTestsToRun } from '../experiments/ab';
import { commercialPartner } from '../experiments/tests/commercial-partner';

const defaultClientSideTests: ABTest[] = [commercialPartner];
const serverSideTests: string[] = [
	'topAboveNavHeight150Variant',
	'topAboveNavHeight200Variant',
	'topAboveNavHeight250Variant',
];

/**
 * Function to check wether metrics should be captured for the current page
 * @param tests - optional array of ABTest to check against.
 * @returns {boolean} whether the user is in a one of a set of client or server-side tests
 * for which we want to always capture metrics.
 */
const shouldCaptureMetrics = (tests = defaultClientSideTests): boolean => {
	const userInClientSideTest = getSynchronousTestsToRun().some((test) =>
		tests.map((t) => t.id).includes(test.id),
	);

	const userInServerSideTest =
		window.guardian.config.tests !== undefined &&
		Object.keys(window.guardian.config.tests).some((test) =>
			serverSideTests.includes(test),
		);
	return userInClientSideTest || userInServerSideTest;
};

export { shouldCaptureMetrics };
