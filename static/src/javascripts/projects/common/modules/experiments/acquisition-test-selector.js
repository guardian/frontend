// @flow
import { variantFor, isInTest } from 'common/modules/experiments/segment-util';
import {
    getForcedTests,
    getForcedVariant,
} from 'common/modules/experiments/utils';
import { testCanBeRun } from 'common/modules/experiments/test-can-run-checks';
import { isViewable } from 'common/modules/commercial/acquisitions-view-log';
import { alwaysAsk } from 'common/modules/experiments/tests/contributions-epic-always-ask-strategy';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { acquisitionsEpicLiveblog } from 'common/modules/experiments/tests/acquisitions-epic-liveblog';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { acquisitionsEpicAlwaysAskElection } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-election';
import { acquisitionsEpicThankYou } from 'common/modules/experiments/tests/acquisitions-epic-thank-you';
import { acquisitionsSupportUsRecurringContribution } from 'common/modules/experiments/tests/acquisitions-support-us-recurring-contributions';

/**
 * acquisition tests in priority order (highest to lowest)
 */
const tests: $ReadOnlyArray<AcquisitionsABTest> = [
    alwaysAsk,
    acquisitionsSupportUsRecurringContribution,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
    acquisitionsEpicLiveblog,
    acquisitionsEpicAlwaysAskElection,
    acquisitionsEpicThankYou,
];

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
