import type { ABTest } from '@guardian/ab-core';
import { consentlessAds } from './tests/consentlessAds';
import { integrateIma } from './tests/integrate-ima';
import { prebidKargo } from './tests/prebid-kargo';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';
import {signInGateDevice} from "common/modules/experiments/tests/sign-in-gate-device";

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	signInGateDevice,
	remoteRRHeaderLinksTest,
	consentlessAds,
	integrateIma,
	prebidKargo,
];
