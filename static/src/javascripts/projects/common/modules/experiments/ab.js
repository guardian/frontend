// @flow

import memoize from 'lodash/memoize';
import {
    allRunnableTests,
    firstRunnableTest,
} from 'common/modules/experiments/ab-core';
import {
    runnableTestsToParticipations,
    testExclusionsWhoseSwitchExists,
} from 'common/modules/experiments/ab-utils';
import {
    registerCompleteEvents,
    registerImpressionEvents,
    trackABTests,
} from 'common/modules/experiments/ab-ophan';
import {
    getParticipationsFromLocalStorage,
    setParticipationsInLocalStorage,
} from 'common/modules/experiments/ab-local-storage';
import { getForcedParticipationsFromUrl } from 'common/modules/experiments/ab-url';
import {
    concurrentTests,
    engagementBannerTests,
    epicTests,
} from 'common/modules/experiments/ab-tests';

export const getEpicTestToRun = (): ?Runnable<EpicABTest> => firstRunnableTest(epicTests);
export const getEngagementBannerTestToRun = (): ?Runnable<AcquisitionsABTest> =>
    firstRunnableTest(engagementBannerTests);

// These are the tests which will actually take effect on this pageview.
// Note that this is a subset of the potentially runnable tests,
// because we only run one epic test and one banner test per pageview.
// We memoize this because it can't change for a given pageview, and because getParticipations()
// and isInVariant() depend on it and these are called in many places.
export const getTestsToRun = memoize(
    (): $ReadOnlyArray<Runnable<ABTest>> => {
        const epicTest = getEpicTestToRun();
        const engagementBannerTest = getEngagementBannerTestToRun();

        return [
            ...allRunnableTests(concurrentTests),
            ...(epicTest ? [epicTest] : []),
            ...(engagementBannerTest ? [engagementBannerTest] : []),
        ];
    }
);

// The tests which will take effect on this pageview,
export const getParticipations = (): Participations =>
    runnableTestsToParticipations(getTestsToRun());

export const isInVariant = (test: ABTest, variantId: string): boolean =>
    getParticipations()[test.id] === { variantId };

export const runAndTrackAbTests = () => {
    const testsToRun = getTestsToRun();

    testsToRun.forEach(test => test.variantToRun.test(test));

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
};
