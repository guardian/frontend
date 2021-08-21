import type { ABTest } from '@guardian/ab-core';
import { commercialPartner } from './tests/commercial-partner';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/tree/main/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	commercialPartner,
	signInGateMainVariant,
	signInGateMainControl,
	remoteRRHeaderLinksTest,
];
