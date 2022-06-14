import type { ABTest } from '@guardian/ab-core';
import { commercialEndOfQuarter2Test } from './tests/commercial-end-of-quarter-2-test';
import { commercialLazyLoadMarginReloaded } from './tests/commercial-lazy-load-margin-reloaded';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	remoteRRHeaderLinksTest,
	commercialEndOfQuarter2Test,
	commercialLazyLoadMarginReloaded,
];
