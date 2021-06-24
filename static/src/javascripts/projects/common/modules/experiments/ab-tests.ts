import type { ABTest } from '@guardian/ab-core';
import { puzzlesBanner } from 'common/modules/experiments/tests/puzzles-banner';
import { remoteRRHeaderLinksTest } from 'common/modules/experiments/tests/remote-header-test';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';

export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	puzzlesBanner,
	remoteRRHeaderLinksTest,
];
