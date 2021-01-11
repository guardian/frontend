import { commercialPrebidSafeframe } from 'common/modules/experiments/tests/commercial-prebid-safeframe.js';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { globalEoyHeaderTest } from 'common/modules/experiments/tests/global-eoy-header-test';

export const concurrentTests = [
    commercialPrebidSafeframe,
    signInGateMainVariant,
    signInGateMainControl,
    globalEoyHeaderTest,
];

export const epicTests = [];

export const engagementBannerTests = [];
