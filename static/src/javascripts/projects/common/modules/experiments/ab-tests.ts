
import { commercialPrebidSafeframe } from "common/modules/experiments/tests/commercial-prebid-safeframe.js";
import { askFourEarning } from "common/modules/experiments/tests/contributions-epic-ask-four-earning";
import { acquisitionsEpicAlwaysAskIfTagged } from "common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged";
import { contributionsBannerArticlesViewedOptOut } from "common/modules/experiments/tests/contribs-banner-articles-viewed-opt-out";
import { connatixTest } from "common/modules/experiments/tests/connatix-ab-test";
import { remoteEpicVariants } from "common/modules/experiments/tests/remote-epic-variants";
import { signInGatePatientia } from "common/modules/experiments/tests/sign-in-gate-patientia";
import { signInGateMainVariant } from "common/modules/experiments/tests/sign-in-gate-main-variant";
import { signInGateMainControl } from "common/modules/experiments/tests/sign-in-gate-main-control";

export const concurrentTests: ReadonlyArray<ABTest> = [commercialPrebidSafeframe, connatixTest, signInGatePatientia, signInGateMainVariant, signInGateMainControl];

export const priorityEpicTest: AcquisitionsABTest = remoteEpicVariants;

export const epicTests: ReadonlyArray<EpicABTest> = [askFourEarning, acquisitionsEpicAlwaysAskIfTagged];

export const engagementBannerTests: ReadonlyArray<AcquisitionsABTest> = [contributionsBannerArticlesViewedOptOut];