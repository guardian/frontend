// @flow
import { variantFor, isInTest } from 'common/modules/experiments/segment-util';
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

/**
 * acquisition tests in priority order (highest to lowest)
 */
const tests = [
    alwaysAsk,
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

// This can be annotated with a return type of ABTest when all of the imported tests are converted
export const getTest = () => {
    const eligibleTests = tests.filter(Test => {
        const t = new Test();
        const forced = window.location.hash.indexOf(`ab-${t.id}`) > -1;
        const variant: Variant = variantFor(t);

        if (forced) return true;
        if (!variant || !variant.options || !variant.options.maxViews)
            return false;

        const {
            count: maxViewCount,
            days: maxViewDays,
            minDaysBetweenViews: minViewDays,
        } = variant.options.maxViews;

        const isUnlimited = variant.options.isUnlimited;

        const withinViewLimit = viewsInPreviousDays(maxViewDays) < maxViewCount;
        const enoughDaysBetweenViews = viewsInPreviousDays(minViewDays) === 0;

        const hasNotReachedRateLimit =
            (withinViewLimit && enoughDaysBetweenViews) || isUnlimited;

        return testCanBeRun(t) && isInTest(t) && hasNotReachedRateLimit;
    });

    return eligibleTests[0] && new eligibleTests[0]();
};
