// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { contributionsBannerArticlesViewedOptOut } from 'common/modules/experiments/tests/contribs-banner-articles-viewed-opt-out';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { signInGatePageview } from 'common/modules/experiments/tests/sign-in-gate-pageview';
import { signInGatePageviewUs } from 'common/modules/experiments/tests/sign-in-gate-pageview-us';
import { signInGatePersonalisedAdCopy } from 'common/modules/experiments/tests/sign-in-gate-personalised-ad-copy';
import { liveblogEpicDesignTest } from 'common/modules/experiments/tests/liveblog-epic-design-test';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    signInGateMainVariant,
    signInGateMainControl,
    signInGatePageview,
    signInGatePageviewUs,
    signInGatePersonalisedAdCopy,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [liveblogEpicDesignTest];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [
    contributionsBannerArticlesViewedOptOut,
];
