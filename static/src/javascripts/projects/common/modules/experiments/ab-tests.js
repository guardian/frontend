// @flow
import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { newsletterMerchUnitLighthouseControl, newsletterMerchUnitLighthouseVariant } from 'common/modules/experiments/tests/newsletter-merch-unit-test';
import { liveblogEpicDesignTest } from 'common/modules/experiments/tests/liveblog-epic-design-test';

export const concurrentTests: $ReadOnlyArray<ABTest> = [
    commercialPrebidSafeframe,
    signInGateMainVariant,
    signInGateMainControl,
    newsletterMerchUnitLighthouseControl,
    newsletterMerchUnitLighthouseVariant
];

export const epicTests: $ReadOnlyArray<EpicABTest> = [liveblogEpicDesignTest];

export const engagementBannerTests: $ReadOnlyArray<AcquisitionsABTest> = [];
