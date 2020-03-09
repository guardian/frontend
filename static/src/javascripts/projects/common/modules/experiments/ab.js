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
    epicTests as hardCodedEpicTests,
    priorityEpicTest as hardCodedPriorityEpicTest,
} from 'common/modules/experiments/ab-tests';
import {
    getEngagementBannerTestsFromGoogleDoc,
    getConfiguredEpicTests,
} from 'common/modules/commercial/contributions-utilities';
import { getMvtValue } from 'common/modules/analytics/mvt-cookie';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import {
    compareVariantDecision,
    getViewLog,
} from '@guardian/slot-machine-client';
import {
    getLastOneOffContributionDate,
    isRecurringContributor,
    shouldNotBeShownSupportMessaging,
} from 'common/modules/commercial/user-features';

// Tmp for Slot Machine work - can remove shortly
const buildKeywordTags = page => {
    const keywordIds = page.keywordIds.split(',');
    const keywords = page.keywords.split(',');
    return keywordIds.map((id, idx) => ({
        id,
        type: 'Keyword',
        title: keywords[idx],
    }));
};

export const getEpicTestToRun = memoize(
    (): Promise<?Runnable<EpicABTest>> => {
        const highPriorityHardCodedTests = hardCodedEpicTests.filter(
            test => test.highPriority
        );
        const lowPriorityHardCodedTests = hardCodedEpicTests.filter(
            test => !test.highPriority
        );

        if (config.get('switches.useConfiguredEpicTests')) {
            return getConfiguredEpicTests().then(configuredEpicTests => {
                configuredEpicTests.forEach(test =>
                    config.set(`switches.ab${test.id}`, true)
                );

                const highPriorityConfiguredTests = configuredEpicTests.filter(
                    test => test.highPriority
                );
                const lowPriorityConfiguredTests = configuredEpicTests.filter(
                    test => !test.highPriority
                );

                const result = firstRunnableTest<EpicABTest>([
                    hardCodedPriorityEpicTest,
                    ...highPriorityConfiguredTests,
                    ...highPriorityHardCodedTests,
                    ...lowPriorityConfiguredTests,
                    ...lowPriorityHardCodedTests,
                ]);

                if (config.get('switches.compareVariantDecision')) {
                    // To evaluate the new contributions service logic we send it the actual decision so that it can
                    // compare this against what it *thinks* is the right decision, and log differences.

                    // send ~ one in ten to reduce initial volume
                    if (Math.random() < 0.1) {
                        const page = config.get('page');
                        // Only compare variants for Epics served in Articles
                        if (page.contentType === 'Article') {
                            const countryCode = geolocationGetSync();
                            compareVariantDecision({
                                targeting: {
                                    contentType: page.contentType,
                                    sectionName: page.section,
                                    shouldHideReaderRevenue:
                                        page.shouldHideReaderRevenue,
                                    isMinuteArticle: config.hasTone('Minute'),
                                    isPaidContent: page.isPaidContent,
                                    tags: buildKeywordTags(page),
                                    countryCode,
                                    showSupportMessaging: !shouldNotBeShownSupportMessaging(),
                                    isRecurringContributor: isRecurringContributor(),
                                    lastOneOffContributionDate: getLastOneOffContributionDate(),
                                    mvtId: getMvtValue(),
                                    epicViewLog: getViewLog(),
                                },
                                expectedTest: result ? result.id : '',
                                expectedVariant: result
                                    ? result.variantToRun.id
                                    : '',
                            });
                        }
                    }
                }

                return result;
            });
        }
        return Promise.resolve(
            firstRunnableTest<EpicABTest>([
                hardCodedPriorityEpicTest,
                ...highPriorityHardCodedTests,
                ...lowPriorityHardCodedTests,
            ])
        );
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
    Promise.all([getEpicTestToRun(), getEngagementBannerTestToRun()]).then(
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
