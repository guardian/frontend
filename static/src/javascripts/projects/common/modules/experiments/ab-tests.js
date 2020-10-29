// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { contributionsBannerArticlesViewedOptOut } from 'common/modules/experiments/tests/contribs-banner-articles-viewed-opt-out';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { signInGateDesignOpt } from 'common/modules/experiments/tests/sign-in-gate-design-opt';
import { liveblogEpicDesignTest } from 'common/modules/experiments/tests/liveblog-epic-design-test';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    signInGateMainVariant,
    signInGateMainControl,
    signInGateDesignOpt,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [liveblogEpicDesignTest];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsBannerArticlesViewedOptOut,
];
