// @flow

import config from 'lib/config';
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
} from 'common/modules/experiments/ab-tests';
import {
    getEngagementBannerTestsFromGoogleDoc,
    getConfiguredLiveblogEpicTests,
} from 'common/modules/commercial/contributions-utilities';

export const getLiveblogEpicTest = memoize(
    (): Promise<?Runnable<ABTest>> => {
        if (config.get('page').contentType === 'LiveBlog') {
            return getConfiguredLiveblogEpicTests().then(configuredEpicTests => {
                configuredEpicTests.forEach(test =>
                    config.set(`switches.ab${test.id}`, true)
                );

                const result = firstRunnableTest<ABTest>(configuredEpicTests);
                return result;
            });
        }

        return Promise.resolve(null);
    }
);

export const getEngagementBannerTestToRun = memoize(
    (): Promise<?Runnable<AcquisitionsABTest>> => {
        if (config.get('switches.engagementBannerTestsFromGoogleDocs')) {
            return getEngagementBannerTestsFromGoogleDoc().then(
                asyncEngagementBannerTests => {
                    asyncEngagementBannerTests.forEach(test =>
                        config.set(`switches.ab${test.id}`, true)
                    );
                    return firstRunnableTest<AcquisitionsABTest>([
                        ...engagementBannerTests,
                        ...asyncEngagementBannerTests,
                    ]);
                }
            );
        }
        return Promise.resolve(
            firstRunnableTest<AcquisitionsABTest>(engagementBannerTests)
        );
    }
);

// These are the tests which will actually take effect on this pageview.
// Note that this is a subset of the potentially runnable tests,
// because we only run one epic test and one banner test per pageview.
// We memoize this because it can't change for a given pageview, and because getParticipations()
// and isInVariantSynchronous() depend on it and these are called in many places.
export const getSynchronousTestsToRun = memoize(() =>
    allRunnableTests<ABTest>(concurrentTests)
);

export const getAsyncTestsToRun = (): Promise<
    $ReadOnlyArray<Runnable<ABTest>>
> =>
    Promise.all([getLiveblogEpicTest(), getEngagementBannerTestToRun()]).then(
        tests => tests.filter(Boolean)
    );

// This excludes epic & banner tests
export const getSynchronousParticipations = (): Participations =>
    runnableTestsToParticipations(getSynchronousTestsToRun());

// This excludes epic & banner tests
export const isInVariantSynchronous = (
    test: ABTest,
    variantId: string
): boolean =>
    getSynchronousTestsToRun().some(
        t => t.id === test.id && t.variantToRun.id === variantId
    );

// This excludes epic & banner tests
// checks if the user in in a given test with any variant
export const isInABTestSynchronous = (test: ABTest): boolean =>
    getSynchronousTestsToRun().some(t => t.id === test.id);

export const runAndTrackAbTests = (): Promise<void> => {
    const testsToRun = getSynchronousTestsToRun();

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

    return getAsyncTestsToRun().then(tests => {
        tests.forEach(test => test.variantToRun.test(test));

        registerImpressionEvents(tests);
        registerCompleteEvents(tests);
        trackABTests(tests);

        setParticipationsInLocalStorage({
            ...getParticipationsFromLocalStorage(),
            ...runnableTestsToParticipations(tests),
        });
    });
};
