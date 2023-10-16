import type { ABTest } from '@guardian/ab-core';
import { billboardsInMerchHigh } from './tests/billboards-in-merch-high';
import { consentlessAds } from './tests/consentlessAds';
import { deeplyReadArticleFooterTest } from './tests/deeply-read-article-footer';
import { eagerPrebid } from './tests/eager-prebid';
import { elementsManager } from './tests/elements-manager';
import { integrateIma } from './tests/integrate-ima';
import { prebidKargo } from './tests/prebid-kargo';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';
import {signInGateTimesOfDay} from "./tests/sign-in-gate-times-of-day";

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	signInGateTimesOfDay,
	remoteRRHeaderLinksTest,
	deeplyReadArticleFooterTest,
	consentlessAds,
	integrateIma,
	billboardsInMerchHigh,
	elementsManager,
	prebidKargo,
	eagerPrebid,
];
