// @flow
import * as segmentUtil from 'common/modules/experiments/segment-util';
import * as testCanRunChecks
    from 'common/modules/experiments/test-can-run-checks';
import * as viewLog from 'common/modules/commercial/acquisitions-view-log';
import alwaysAsk
    from 'common/modules/experiments/tests/contributions-epic-always-ask-strategy';
import askFourEarning
    from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import acquisitionsEpicLiveBlog
    from 'common/modules/experiments/tests/acquisitions-epic-liveblog';
import acquisitionsEpicTestimonialsRoundTwo
    from 'common/modules/experiments/tests/acquisitions-epic-testimonials-round-two';
import acquisitionsEpicSingleCta
    from 'common/modules/experiments/tests/acquisitions-epic-single-cta';

/**
 * acquisition tests in priority order (highest to lowest)
 */
const tests = [
    alwaysAsk,
    acquisitionsEpicSingleCta,
    acquisitionsEpicTestimonialsRoundTwo,
    askFourEarning,
    acquisitionsEpicLiveBlog,
];

export const epicEngagementBannerTests = tests.reduce((out, Test) => {
    const testInstance = new Test();

    if (testInstance.isEngagementBannerTest) {
        out.push(testInstance);
    }
    return out;
}, []);

export const abTestClashData = tests.map(Test => new Test());

export const getTest = () => {
    const eligibleTests = tests.filter(Test => {
        const t = new Test();
        const forced = window.location.hash.indexOf(`ab-${t.id}`) > -1;
        const variant = segmentUtil.variantFor(t);

        if (!variant || !variant.maxViews) return false;

        const maxViewCount = variant.maxViews.count;
        const withinViewLimit =
            viewLog.viewsInPreviousDays(variant.maxViews.days) < maxViewCount;
        const enoughDaysBetweenViews =
            variant.maxViews &&
            viewLog.viewsInPreviousDays(
                variant.maxViews.minDaysBetweenViews
            ) === 0;

        const hasNotReachedRateLimit =
            (withinViewLimit && enoughDaysBetweenViews) || variant.isUnlimited;

        return (
            forced ||
            (testCanRunChecks.testCanBeRun(t) &&
                segmentUtil.isInTest(t) &&
                hasNotReachedRateLimit)
        );
    });

    return eligibleTests[0] && new eligibleTests[0]();
};
