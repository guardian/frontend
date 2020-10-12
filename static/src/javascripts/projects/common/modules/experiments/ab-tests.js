// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { contributionsBannerArticlesViewedOptOut } from 'common/modules/experiments/tests/contribs-banner-articles-viewed-opt-out';
import { connatixTest } from 'common/modules/experiments/tests/connatix-ab-test';
import { remoteEpicVariants } from 'common/modules/experiments/tests/remote-epic-variants';
import { signInGatePatientia } from 'common/modules/experiments/tests/sign-in-gate-patientia';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { signInGatePageview } from 'common/modules/experiments/tests/sign-in-gate-pageview';
import { signInGatePersonalisedAdCopy } from 'common/modules/experiments/tests/sign-in-gate-personalised-ad-copy';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    connatixTest,
    signInGatePatientia,
    signInGateMainVariant,
    signInGateMainControl,
    signInGatePageview,
    signInGatePersonalisedAdCopy,
];

export const priorityEpicTest: AcquisitionsABTest = remoteEpicVariants;

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsBannerArticlesViewedOptOut,
];
