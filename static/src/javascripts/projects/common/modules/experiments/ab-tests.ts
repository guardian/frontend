import type { ABTest } from '@guardian/ab-core';
import { auxiaSignInGate } from './tests/auxia-sign-in-gate';
import { consentOrPayBannerTest } from './tests/consent-or-pay-banner';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	consentOrPayBannerTest,
	signInGateMainVariant,
	signInGateMainControl,
	remoteRRHeaderLinksTest,
	auxiaSignInGate,
];
