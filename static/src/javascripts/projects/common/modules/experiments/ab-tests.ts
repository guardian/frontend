import type { ABTest } from '@guardian/ab-core';
import { integrateCriteo } from './tests/integrate-criteo';
import { integrateSmart } from './tests/integrate-smart';
import { prebidTimeout } from './tests/prebid-timeout';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	remoteRRHeaderLinksTest,
	prebidTimeout,
	integrateCriteo,
	integrateSmart,
];
