// @flow
import type { Variant } from 'common/modules/experiments/ab-types';

import { variantFor, isInTest } from 'common/modules/experiments/segment-util';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
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

// This can be annotated with a return type of ABTest when all of the imported tests are converted
export const getTest = () => {
    const eligibleTests = tests.filter(Test => {
        const t = new Test();
        const forced = window.location.hash.indexOf(`ab-${t.id}`) > -1;
        const variant: Variant = variantFor(t);

        if (!variant || !variant.options || !variant.options.maxViews)
            return false;

        const {
            count: maxViewCount,
            days: maxViewDays,
            minDaysBetweenViews: minViewDays,
        } = variant.options.maxViews;

        const isUnlimited = variant.options.isUnlimited;

        const withinViewLimit =
            viewLog.viewsInPreviousDays(maxViewDays) < maxViewCount;
        const enoughDaysBetweenViews =
            viewLog.viewsInPreviousDays(minViewDays) === 0;

        const hasNotReachedRateLimit =
            (withinViewLimit && enoughDaysBetweenViews) || isUnlimited;

        return (
            forced || (testCanBeRun(t) && isInTest(t) && hasNotReachedRateLimit)
        );
    });

    return eligibleTests[0] && new eligibleTests[0]();
};
