import type { ABTest } from '@guardian/ab-core';
import { concurrentTests } from 'common/modules/experiments/ab-tests';

/**
 * Take the set of currently running tests and attach them to the window
 *
 * DCR will load this script to pick up the test definitions
 *
 */

export type ABTestMap = Record<
	string,
	| ABTest
	/**
	 * Without having --noUncheckedIndexedAccess enabled it's safer for these to
	 * be possibly defined
	 */
	| undefined
>;

const clientSideABTests = concurrentTests.reduce<ABTestMap>(
	(abTests, test) => ({ ...abTests, [test.id]: test }),
	{},
);

window.guardian.config.clientSideABTests = clientSideABTests;
