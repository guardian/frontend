import type { ABTest } from '@guardian/ab-core';
import { mpuWhenNoEpic } from './tests/mpu-when-no-epic';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateAlternativeWording } from './tests/sign-in-gate-alternative-wording';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	signInGateAlternativeWording,
	remoteRRHeaderLinksTest,
	mpuWhenNoEpic,
];
