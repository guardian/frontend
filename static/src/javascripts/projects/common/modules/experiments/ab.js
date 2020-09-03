// @flow

import config from 'lib/config';
import memoize from 'lodash/memoize';
import { runnableTestsToParticipations } from 'common/modules/experiments/ab-utils';
import {
    registerCompleteEvents,
    registerImpressionEvents,
    trackABTests,
} from 'common/modules/experiments/ab-ophan';
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
} from '@guardian/automat-contributions';
import {
    getLastOneOffContributionDate,
    isRecurringContributor,
    shouldNotBeShownSupportMessaging,
} from 'common/modules/commercial/user-features';
import {
    automatLog,
    logAutomatEvent,
} from 'common/modules/experiments/automatLog';
import { AB, testConfig } from './ab-gareth';
import type { ABType } from './ab-gareth';

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

/* eslint-disable import/no-mutable-exports */
export let ABLib: ABType = AB(testConfig(concurrentTests));

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

                const result = ABLib.firstRunnableTest<AcquisitionsABTest>([
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
                            expectedCampaignId: result ? result.campaignId : '',
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
            ABLib.firstRunnableTest<ABTest>([
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
                    return ABLib.firstRunnableTest<AcquisitionsABTest>([
                        ...engagementBannerTests,
                        ...asyncEngagementBannerTests,
                    ]);
                }
            );
        }
        return Promise.resolve(
            ABLib.firstRunnableTest<AcquisitionsABTest>(engagementBannerTests)
        );
    }
);

// These are the tests which will actually take effect on this pageview.
// Note that this is a subset of the potentially runnable tests,
// because we only run one epic test and one banner test per pageview.
// We memoize this because it can't change for a given pageview, and because getParticipations()
// and isInVariantSynchronous() depend on it and these are called in many places.
export const getSynchronousTestsToRun = memoize(() =>
    ABLib.allRunnableTests<ABTest>(concurrentTests)
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

export const refreshAB = (): void => {
    ABLib = AB(testConfig(concurrentTests));
};

// This excludes epic & banner tests
export const isInVariantSynchronous = (
    test: ABTest,
    variantId: string
): boolean => ABLib.isUserInVariant(test.id, variantId);

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

    return getAsyncTestsToRun().then(tests => {
        tests.forEach(test => test.variantToRun.test(test));

        registerImpressionEvents(tests);
        registerCompleteEvents(tests);
        trackABTests(tests);
    });
};
