// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { newsletterEmbeds } from 'common/modules/experiments/tests/newsletter-embed-test';
import { liveblogEpicDesignTest } from 'common/modules/experiments/tests/liveblog-epic-design-test';
import { globalEoyHeaderTest } from 'common/modules/experiments/tests/global-eoy-header-test';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    signInGateMainVariant,
    signInGateMainControl,
    newsletterEmbeds,
    globalEoyHeaderTest,
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [liveblogEpicDesignTest];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [];
