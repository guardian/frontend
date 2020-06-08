// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { askFourEarning } from 'common/modules/experiments/tests/contributions-epic-ask-four-earning';
import { acquisitionsEpicAlwaysAskIfTagged } from 'common/modules/experiments/tests/acquisitions-epic-always-ask-if-tagged';
import { articlesViewedBanner } from 'common/modules/experiments/tests/contribs-banner-articles-viewed';
import { contributionsBannerArticlesViewedOptOut } from 'common/modules/experiments/tests/contribs-banner-articles-viewed-opt-out';
import { xaxisAdapterTest } from 'common/modules/experiments/tests/commercial-xaxis-adapter';
import { appnexusUSAdapter } from 'common/modules/experiments/tests/commercial-appnexus-us-adapter';
import { pangaeaAdapterTest } from 'common/modules/experiments/tests/commercial-pangaea-adapter';
import { amazonA9Test } from 'common/modules/experiments/tests/amazon-a9';
import { connatixTest } from 'common/modules/experiments/tests/connatix-ab-test';
import { remoteEpicVariants } from 'common/modules/experiments/tests/remote-epic-variants';
import { signInGatePatientia } from 'common/modules/experiments/tests/sign-in-gate-patientia';
import { signInGateCentesimus } from 'common/modules/experiments/tests/sign-in-gate-centesimus';
import { signInGateVii } from 'common/modules/experiments/tests/sign-in-gate-vii';
import { contributionsCovidBannerRoundTwo } from 'common/modules/experiments/tests/contribs-banner-covid-round-two';
import { commercialRedplanet } from 'common/modules/experiments/tests/commercial-redplanet-aus';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    commercialRedplanet,
    amazonA9Test,
    connatixTest,
    xaxisAdapterTest,
    appnexusUSAdapter,
    pangaeaAdapterTest,
    signInGatePatientia,
    signInGateVii,
    signInGateCentesimus,
];

export const priorityEpicTest: AcquisitionsABTest = remoteEpicVariants;

export const epicTests: $ReadOnlyArray<EpicABTest> = [
    askFourEarning,
    acquisitionsEpicAlwaysAskIfTagged,
];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsCovidBannerRoundTwo,
    articlesViewedBanner,
    contributionsBannerArticlesViewedOptOut,
];
