import type { ABTest, Participations, Runnable } from '@guardian/ab-core';
import { memoize } from 'lodash-es';
import { allRunnableTests } from './ab-core';
import {
	getParticipationsFromLocalStorage,
	setParticipationsInLocalStorage,
} from './ab-local-storage';
import {
	registerCompleteEvents,
	registerImpressionEvents,
	trackABTests,
} from './ab-ophan';
import { concurrentTests } from './ab-tests';
import { getForcedParticipationsFromUrl } from './ab-url';
import {
	runnableTestsToParticipations,
	testExclusionsWhoseSwitchExists,
} from './ab-utils';

// These are the tests which will actually take effect on this pageview.
// Note that this is a subset of the potentially runnable tests,
// because we only run one epic test and one banner test per pageview.
// We memoize this because it can't change for a given pageview, and because getParticipations()
// and isInVariantSynchronous() depend on it and these are called in many places.
export const getSynchronousTestsToRun = memoize(() =>
	allRunnableTests(concurrentTests),
);
export const getAsyncTestsToRun = (): Promise<
	ReadonlyArray<Runnable<ABTest>>
> => Promise.all([]).then((tests) => tests.filter(Boolean));

// This excludes epic & banner tests
export const getSynchronousParticipations = (): Participations =>
	runnableTestsToParticipations(getSynchronousTestsToRun());

// This excludes epic & banner tests
export const isInVariantSynchronous = (
	test: ABTest,
	variantId: string,
): boolean =>
	getSynchronousTestsToRun().some(
		(t) => t.id === test.id && t.variantToRun.id === variantId,
	);

// This excludes epic & banner tests
// checks if the user in in a given test with any variant
export const isInABTestSynchronous = (test: ABTest): boolean =>
	getSynchronousTestsToRun().some((t) => t.id === test.id);

export const runAndTrackAbTests = (): Promise<void> => {
	const testsToRun = getSynchronousTestsToRun();

	testsToRun.forEach((test) =>
		test.variantToRun.test(test as unknown as Record<string, unknown>),
	);

	registerImpressionEvents(testsToRun);
	registerCompleteEvents(testsToRun);
	trackABTests(testsToRun);

	// If a test has a 'notintest' variant specified in localStorage,
	// it will prevent them from participating in the test.
	// This is typically set by the URL hash, but we want it to persist for
	// subsequent pageviews so we save it to localStorage.
	// We don't persist those whose switch is gone from the backend,
	// to ensure that old tests get cleaned out and localStorage doesn't keep growing.
	const testExclusions: Participations = testExclusionsWhoseSwitchExists({
		...getParticipationsFromLocalStorage(),
		...getForcedParticipationsFromUrl(),
	});

	setParticipationsInLocalStorage({
		...runnableTestsToParticipations(testsToRun),
		...testExclusions,
	});

	return getAsyncTestsToRun().then((tests) => {
		tests.forEach((test) =>
			test.variantToRun.test(test as unknown as Record<string, unknown>),
		);

		registerImpressionEvents(tests);
		registerCompleteEvents(tests);
		trackABTests(tests);

		setParticipationsInLocalStorage({
			...getParticipationsFromLocalStorage(),
			...runnableTestsToParticipations(tests),
		});
	});
};
