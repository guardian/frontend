import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { liveblogEpicDesignTest } from 'common/modules/experiments/tests/liveblog-epic-design-test';
import {
    newsletterMerchUnitLighthouseControl,
    newsletterMerchUnitLighthouseVariant,
} from 'common/modules/experiments/tests/newsletter-merch-unit-test';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';

export const concurrentTests: readonly ABTest[] = [
    commercialPrebidSafeframe,
    signInGateMainVariant,
    signInGateMainControl,
    newsletterMerchUnitLighthouseControl,
    newsletterMerchUnitLighthouseVariant,
];

export const epicTests: readonly EpicABTest[] = [liveblogEpicDesignTest];

export const engagementBannerTests: readonly AcquisitionsABTest[] = [];
