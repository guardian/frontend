import type { ABTest } from '@guardian/ab-core';
import { consentlessAds } from './tests/consentlessAds';
import { deeplyReadArticleFooterTest } from './tests/deeply-read-article-footer';
import { integrateIMA } from './tests/integrate-ima';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { shadyPieClickThrough } from './tests/shady-pie-click-through';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';
import {
	signInGateMandatoryLongTestRunAunz,
	signInGateMandatoryLongTestRunEu,
	signInGateMandatoryLongTestRunNa,
	signInGateMandatoryLongTestRunUk,
} from './tests/sign-in-gate-mandatory-long';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	remoteRRHeaderLinksTest,
	deeplyReadArticleFooterTest,
	consentlessAds,
	integrateIMA,
	signInGateMandatoryLongTestRunAunz,
	signInGateMandatoryLongTestRunEu,
	signInGateMandatoryLongTestRunNa,
	signInGateMandatoryLongTestRunUk,
	shadyPieClickThrough,
];
