import type { ABTest } from '@guardian/ab-core';
import { blockSupporterRevenueMessagingSport } from './tests/block-supporter-revenue-messaging-sport';
import { mastheadWithHighlights } from './tests/masthead-with-highlights';
import { mpuWhenNoEpic } from './tests/mpu-when-no-epic';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateAlternativeWording } from './tests/sign-in-gate-alternative-wording';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';
import { updatedHeaderDesign } from './tests/updated-header-design';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	signInGateAlternativeWording,
	remoteRRHeaderLinksTest,
	mpuWhenNoEpic,
	blockSupporterRevenueMessagingSport,
	updatedHeaderDesign,
	mastheadWithHighlights,
];
