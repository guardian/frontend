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
    getWeeklyArticleHistory,
} from '@guardian/automat-client';
import {
    getLastOneOffContributionDate,
    isRecurringContributor,
    shouldNotBeShownSupportMessaging,
} from 'common/modules/commercial/user-features';
import {
    automatLog,
    logAutomatEvent,
} from 'common/modules/experiments/automatLog';

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
    (): Promise<?Runnable<ABTest>> => {
        const highPriorityHardCodedTests = hardCodedEpicTests.filter(
            test => test.highPriority
        );
        const lowPriorityHardCodedTests = hardCodedEpicTests.filter(
            test => !test.highPriority
        );

        if (config.get('switches.useConfiguredEpicTests')) {
            return getConfiguredEpicTests().then(configuredEpicTests => {
                // We want to confirm that the epic tests are getting loaded as we see a
                // lot of cases where we suspect they are not.
                logAutomatEvent({
                    key: 'testIDs',
                    value: configuredEpicTests.map(test => test.id),
                });

                configuredEpicTests.forEach(test =>
                    config.set(`switches.ab${test.id}`, true)
                );

                const highPriorityConfiguredTests = configuredEpicTests.filter(
                    test => test.highPriority
                );
                const lowPriorityConfiguredTests = configuredEpicTests.filter(
                    test => !test.highPriority
                );

                const result = firstRunnableTest<ABTest>([
                    hardCodedPriorityEpicTest,
                    ...highPriorityConfiguredTests,
                    ...highPriorityHardCodedTests,
                    ...lowPriorityConfiguredTests,
                    ...lowPriorityHardCodedTests,
                ]);

                const page = config.get('page');

                // No point in going forward with variant comparison in
                // these cases
                if (
                    page.contentType !== 'Article' ||
                    configuredEpicTests.length === 0 ||
                    (result && result.id !== 'RemoteEpicVariants')
                ) {
                    return result;
                }

                if (config.get('switches.compareVariantDecision')) {
                    // To evaluate the new contributions service logic we send it the actual decision so that it can
                    // compare this against what it *thinks* is the right decision, and log differences.

                    // send ~ one in ten to reduce initial volume
                    if (Math.random() < 0.1) {
                        const countryCode = geolocationGetSync();
                        compareVariantDecision({
                            targeting: {
                                contentType: page.contentType,
                                sectionName: page.section,
                                shouldHideReaderRevenue:
                                    page.shouldHideReaderRevenue,
                                isMinuteArticle: page.isMinuteArticle,
                                isPaidContent:
                                    page.sponsorshipType === 'paid-content',
                                isSensitive: page.isSensitive,
                                tags: buildKeywordTags(page),
                                countryCode,
                                showSupportMessaging: !shouldNotBeShownSupportMessaging(),
                                isRecurringContributor: isRecurringContributor(),
                                lastOneOffContributionDate: getLastOneOffContributionDate(),
                                mvtId: getMvtValue(),
                                epicViewLog: getViewLog(),
                                weeklyArticleHistory: getWeeklyArticleHistory(),
                            },
                            expectedTest: result ? result.id : '',
                            expectedVariant: result
                                ? result.variantToRun.id
                                : '',
                            expectedCampaignId: result ? ((result: any).campaignId)  : '', // type cast as must be EpicABTest at this poimt
                            expectedCampaignCode: result
                                ? result.variantToRun.campaignCode
                                : '',
                            frontendLog: automatLog,
                        });
                    }
                }

                return result;
            });
        }

        return Promise.resolve(
            firstRunnableTest<ABTest>([
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

        registerImpressionEvents(tests); // only if variants not function
        registerCompleteEvents(tests); // only if variants not function
        trackABTests(tests);

        setParticipationsInLocalStorage({
            ...getParticipationsFromLocalStorage(), // existing
            ...runnableTestsToParticipations(tests), // data transformation for new values
        });
    });
};
