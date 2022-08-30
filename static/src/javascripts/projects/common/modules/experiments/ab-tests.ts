import type { ABTest } from '@guardian/ab-core';
import { consentlessAds } from './tests/consentlessAds';
import { deeplyReadArticleFooterTest } from './tests/deeply-read-article-footer';
import { integrateIMA } from './tests/integrate-ima';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';
import { signInGateMandatoryLongTestRun } from './tests/sign-in-gate-mandatory-long';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	signInGateMandatoryLongTestRun,
	remoteRRHeaderLinksTest,
	deeplyReadArticleFooterTest,
	consentlessAds,
	integrateIMA,
];
