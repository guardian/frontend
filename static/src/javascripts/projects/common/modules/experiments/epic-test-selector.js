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
import { acquisitionsEpicFromGoogleDocOneVariant } from 'common/modules/experiments/tests/acquisitions-epic-from-google-doc-one-variant';
import { acquisitionsEpicFromGoogleDocTwoVariants } from 'common/modules/experiments/tests/acquisitions-epic-from-google-doc-two-variants';
import { acquisitionsEpicFromGoogleDocThreeVariants } from 'common/modules/experiments/tests/acquisitions-epic-from-google-doc-three-variants';
import { acquisitionsEpicFromGoogleDocFourVariants } from 'common/modules/experiments/tests/acquisitions-epic-from-google-doc-four-variants';
import { acquisitionsEpicFromGoogleDocFiveVariants } from 'common/modules/experiments/tests/acquisitions-epic-from-google-doc-five-variants';
import { acquisitionsEpicAuPostOneMillion } from 'common/modules/experiments/tests/acquisitions-epic-au-post-one-million';
import { acquisitionsEpicUsPreEndOfYear } from 'common/modules/experiments/tests/acquisitions-epic-us-pre-end-of-year';
import { acquisitionsEpicUsTopTicker } from 'common/modules/experiments/tests/acquisitions-epic-us-top-ticker';
import { acquisitionsEpicUsFromGoogleDoc } from 'common/modules/experiments/tests/acquisitions-epic-us-from-google-doc';

const isViewable = (v: Variant, t: ABTest): boolean => {
    if (!v.options) return false;
    if (v.options.isUnlimited) return true;
    if (!v.options.maxViews) return false;

    const {
        count: maxViewCount,
        days: maxViewDays,
        minDaysBetweenViews: minViewDays,
    } = v.options.maxViews;

    const isUnlimited = v.options.isUnlimited;
    // Should all acquisition tests be of type EpicABTest?
    // $FlowFixMe
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
export const hardcodedEpicTests: $ReadOnlyArray<AcquisitionsABTest> = [
    acquisitionsEpicUsTopTicker,
    acquisitionsEpicUsPreEndOfYear,
    acquisitionsEpicAuPostOneMillion,
    acquisitionsEpicFromGoogleDocOneVariant,
    acquisitionsEpicFromGoogleDocTwoVariants,
    acquisitionsEpicFromGoogleDocThreeVariants,
    acquisitionsEpicFromGoogleDocFourVariants,
    acquisitionsEpicFromGoogleDocFiveVariants,
    acquisitionsEpicAusEnvCampaign,
    acquisitionsEpicUSGunCampaign,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
    acquisitionsEpicLiveblog,
    acquisitionsEpicThankYou,
];

export const asyncEpicTests: $ReadOnlyArray<Promise<AcquisitionsABTest>> = [
    acquisitionsEpicUsFromGoogleDoc,
];

export const getAllEpicTests = (): Promise<$ReadOnlyArray<AcquisitionsABTest>> => Promise.all(asyncEpicTests)
    .then(fetchedEpicTests => [...fetchedEpicTests, ...hardcodedEpicTests]);

export const getEpicTestToDisplay = (): Promise<AcquisitionsABTest> => getAllEpicTests().then(epicTests => {
    const forcedTests = getForcedTests()
        .map(({ testId }) => epicTests.find(t => t.id === testId))
        .filter(Boolean);

    let epicTest;

    if (forcedTests.length) {
        epicTest = forcedTests.find(t => {
            const variant: ?Variant = getForcedVariant(t);
            return variant && testCanBeRun(t) && isViewable(variant, t);
        });
    } else {
        epicTest = epicTests.find(t => {
            const variant: ?Variant = variantFor(t);
            if (variant) {
                const isTestRunnable = testCanBeRun(t);
                const isUserInTest = isInTest(t);
                const isEpicViewable = isViewable(variant, t);
                return isTestRunnable && isUserInTest && isEpicViewable;
            }
            return false;
        });
    }

    return epicTest || Promise.reject(null);
});
