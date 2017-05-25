// @flow
import { variantFor, isInTest } from 'common/modules/experiments/segment-util';
import {
    getForcedTests,
    getForcedVariant,
} from 'common/modules/experiments/utils';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import {
    viewsInPreviousDays,
} from 'common/modules/commercial/acquisitions-view-log';
import alwaysAsk
    from 'common/modules/experiments/tests/contributions-epic-always-ask-strategy';
import askFourEarning
    from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import acquisitionsEpicLiveBlog
    from 'common/modules/experiments/tests/acquisitions-epic-liveblog';
import acquisitionsEpicTestimonialsRoundTwo
    from 'common/modules/experiments/tests/acquisitions-epic-testimonials-round-two';
import acquisitionsEpicPreElection
    from 'common/modules/experiments/tests/acquisitions-epic-pre-election';
import acquisitionsEpicAlwaysAskIfTagged
    from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';

/**
 * acquisition tests in priority order (highest to lowest)
 */
const tests = [
    alwaysAsk,
    acquisitionsEpicPreElection,
    acquisitionsEpicTestimonialsRoundTwo,
    askFourEarning,
    acquisitionsEpicLiveBlog,
    acquisitionsEpicAlwaysAskIfTagged,
].map(Test => new Test());

const isViewable = (v: Variant): boolean => {
    if (!v.options || !v.options.maxViews) return false;

    const {
        count: maxViewCount,
        days: maxViewDays,
        minDaysBetweenViews: minViewDays,
    } = v.options.maxViews;

    const isUnlimited = v.options.isUnlimited;

    const withinViewLimit = viewsInPreviousDays(maxViewDays) < maxViewCount;
    const enoughDaysBetweenViews = viewsInPreviousDays(minViewDays) === 0;
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
            return variant && testCanBeRun(t) && isViewable(variant);
        });

    return tests.find(t => {
        const variant: ?Variant = variantFor(t);
        return variant && testCanBeRun(t) && isInTest(t) && isViewable(variant);
    });
};
