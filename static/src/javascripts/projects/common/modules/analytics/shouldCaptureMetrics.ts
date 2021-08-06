import type { ABTest } from '@guardian/ab-core';
import { getSynchronousTestsToRun } from '../experiments/ab';
import { commercialPartner } from '../experiments/tests/commercial-partner';
import { improveSkins } from '../experiments/tests/improve-skins';

const defaultTests: ABTest[] = [commercialPartner, improveSkins];
/**
 * Function to check wether metrics should be captured for the current page
 * @param tests - optional array of ABTest to check against, default to above.
 * @returns true if the user is in a test
 */
const shouldCaptureMetrics = (tests = defaultTests): boolean => {
	return getSynchronousTestsToRun().some((test) =>
		tests.map((t) => t.id).includes(test.id),
	);
};

export { shouldCaptureMetrics };
