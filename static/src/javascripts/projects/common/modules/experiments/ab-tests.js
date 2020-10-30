// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { contributionsBannerArticlesViewedOptOut } from 'common/modules/experiments/tests/contribs-banner-articles-viewed-opt-out';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    signInGateMainVariant,
    signInGateMainControl,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsBannerArticlesViewedOptOut,
];
