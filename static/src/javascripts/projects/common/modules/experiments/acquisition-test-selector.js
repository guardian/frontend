// @flow
import { variantFor, isInTest } from 'common/modules/experiments/segment-util';
import {
    getForcedTests,
    getForcedVariant,
} from 'common/modules/experiments/utils';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import { viewsInPreviousDays } from 'common/modules/commercial/acquisitions-view-log';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { acquisitionsEpicLiveblog } from 'common/modules/experiments/tests/acquisitions-epic-liveblog';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { acquisitionsEpicThankYou } from 'common/modules/experiments/tests/acquisitions-epic-thank-you';
import { acquisitionsEpicUSGunCampaign } from 'common/modules/experiments/tests/acquisitions-epic-us-gun-campaign';
import { acquisitionsEpicAusEnvCampaign } from 'common/modules/experiments/tests/acquisitions-epic-aus-env-campaign';
import { acquisitionsEpicAudSupport } from 'common/modules/experiments/tests/acquisitions-epic-aud-support';
import { acquisitionsEpicCambridgeAnalyticaAlwaysAskFinal } from 'common/modules/experiments/tests/acquisitions-epic-cambridge-analytica-always-ask-final';

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

/**
 * acquisition tests in priority order (highest to lowest)
 */
export const acquisitionsTests: $ReadOnlyArray<AcquisitionsABTest> = [
    acquisitionsEpicCambridgeAnalyticaAlwaysAskFinal,
    acquisitionsEpicAusEnvCampaign,
    acquisitionsEpicUSGunCampaign,
    acquisitionsEpicAudSupport,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
    acquisitionsEpicLiveblog,
    acquisitionsEpicThankYou,
];

export const getTest = (): ?ABTest => {
    const forcedTests = getForcedTests()
        .map(({ testId }) => acquisitionsTests.find(t => t.id === testId))
        .filter(Boolean);

    if (forcedTests.length)
        return forcedTests.find(t => {
            const variant: ?Variant = getForcedVariant(t);
            return variant && testCanBeRun(t) && isViewable(variant, t);
        });

    return acquisitionsTests.find(t => {
        const variant: ?Variant = variantFor(t);
        return (
            variant && testCanBeRun(t) && isInTest(t) && isViewable(variant, t)
        );
    });
};
