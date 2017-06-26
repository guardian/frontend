// @flow
import { variantFor, isInTest } from 'common/modules/experiments/segment-util';
import {
    getForcedTests,
    getForcedVariant,
} from 'common/modules/experiments/utils';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import { viewsInPreviousDays } from 'common/modules/commercial/acquisitions-view-log';
import alwaysAsk from 'common/modules/experiments/tests/contributions-epic-always-ask-strategy';
import bundlePriceTest1 from 'common/modules/experiments/tests/bundle-digital-sub-price-test-1';
import askFourEarning from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import acquisitionsEpicLiveBlog from 'common/modules/experiments/tests/acquisitions-epic-liveblog';
import acquisitionsEpicLiveBlogDesignTest from 'common/modules/experiments/tests/acquisitions-epic-liveblog-design-test';
import acquisitionsEpicAlwaysAskIfTagged from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import acquisitionsEpicAlwaysAskElection from 'common/modules/experiments/tests/acquisitions-epic-always-ask-election';
import acquisitionsEpicThankYou from 'common/modules/experiments/tests/acquisitions-epic-thank-you';
import acquisitionsThisLandSeries from 'common/modules/experiments/tests/acquisitions-this-land-series';
import epicForBrexitCohort from 'common/modules/experiments/tests/epic-for-brexit-cohort';

/**
 * acquisition tests in priority order (highest to lowest)
 */
const tests = [
    alwaysAsk,
    acquisitionsThisLandSeries,
    bundlePriceTest1,
    epicForBrexitCohort,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
    acquisitionsEpicLiveBlogDesignTest,
    acquisitionsEpicLiveBlog,
    acquisitionsEpicAlwaysAskElection,
    acquisitionsEpicThankYou,
];

const isViewable = (v: Variant, t: ABTest): boolean => {
    if (!v.options || !v.options.maxViews) return false;

    const {
        count: maxViewCount,
        days: maxViewDays,
        minDaysBetweenViews: minViewDays,
    } = v.options.maxViews;

    const isUnlimited = v.options.isUnlimited;
    const testId = t.useLocalViewLog ? t.id : undefined;

    const withinViewLimit =
        viewsInPreviousDays(maxViewDays, testId) < maxViewCount;
    const enoughDaysBetweenViews =
        viewsInPreviousDays(minViewDays, testId) === 0;
    return (withinViewLimit && enoughDaysBetweenViews) || isUnlimited;
};

export const epicEngagementBannerTests = () =>
    tests.filter(t => t.isEngagementBannerTest);

export const abTestClashData = tests;

export const getTest = (): ?ABTest => {
    const forcedTests = getForcedTests()
        .map(({ testId }) => tests.find(t => t.id === testId))
        .filter(Boolean);

    if (forcedTests.length)
        return forcedTests.find(t => {
            const variant: ?Variant = getForcedVariant(t);
            return variant && testCanBeRun(t) && isViewable(variant, t);
        });

    return tests.find(t => {
        const variant: ?Variant = variantFor(t);
        return (
            variant && testCanBeRun(t) && isInTest(t) && isViewable(variant, t)
        );
    });
};
