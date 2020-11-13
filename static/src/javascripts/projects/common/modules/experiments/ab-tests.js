// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { contributionsBannerArticlesViewedOptOut } from 'common/modules/experiments/tests/contribs-banner-articles-viewed-opt-out';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { newsletterMerchUnitLighthouseControl, newsletterMerchUnitLighthouseVariant } from 'common/modules/experiments/tests/newsletter-merch-unit-test';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    signInGateMainVariant,
    signInGateMainControl,
    newsletterMerchUnitLighthouseControl,
    newsletterMerchUnitLighthouseVariant
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsBannerArticlesViewedOptOut,
];
