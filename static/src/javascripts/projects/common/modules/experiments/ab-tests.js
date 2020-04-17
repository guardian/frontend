// @flow
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { amazonA9Test } from 'common/modules/experiments/tests/amazon-a9';
import { appnexusUSAdapter } from 'common/modules/experiments/tests/commercial-appnexus-us-adapter';
import { commercialCmpCopy } from 'common/modules/experiments/tests/commercial-cmp-copy';
import { pangaeaAdapterTest } from 'common/modules/experiments/tests/commercial-pangaea-adapter';
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { xaxisAdapterTest } from 'common/modules/experiments/tests/commercial-xaxis-adapter';
import { connatixTest } from 'common/modules/experiments/tests/connatix-ab-test';
import { articlesViewedBanner } from 'common/modules/experiments/tests/contribs-banner-articles-viewed';
import { contributionsCovidBannerRoundTwo } from 'common/modules/experiments/tests/contribs-banner-covid-round-two';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { contributionsEpicPrecontributionReminderRoundTwo } from 'common/modules/experiments/tests/contributions-epic-precontribution-reminder-round-two';
import { frontendDotcomRenderingEpic } from 'common/modules/experiments/tests/frontend-dotcom-rendering-epic';
import { signInGate } from 'common/modules/experiments/tests/sign-in-gate';
import { signInGateScale } from 'common/modules/experiments/tests/sign-in-gate-scale';
import { signInGateVariant } from 'common/modules/experiments/tests/sign-in-gate-variant';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    amazonA9Test,
    connatixTest,
    xaxisAdapterTest,
    appnexusUSAdapter,
    pangaeaAdapterTest,
    signInGate,
    signInGateVariant,
    signInGateScale,
    commercialCmpCopy,
];

export const priorityEpicTest: EpicABTest = frontendDotcomRenderingEpic;

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    contributionsEpicPrecontributionReminderRoundTwo,
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsCovidBannerRoundTwo,
    articlesViewedBanner,
];
