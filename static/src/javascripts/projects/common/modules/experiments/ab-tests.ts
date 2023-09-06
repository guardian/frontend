import type { ABTest } from '@guardian/ab-core';
import { billboardsInMerchHigh } from './tests/billboards-in-merch-high';
import { consentlessAds } from './tests/consentlessAds';
import { deeplyReadArticleFooterTest } from './tests/deeply-read-article-footer';
import { elementsManager } from './tests/elements-manager';
import { integrateIma } from './tests/integrate-ima';
import { liveblogRightColumnAds } from './tests/liveblog-right-column-ads';
import { prebidKargo } from './tests/prebid-kargo';
import { publicGoodTest } from './tests/public-good';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateCopyTestRepeatSept2023} from './tests/sign-in-gate-copy-test-variant';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	signInGateCopyTestRepeatSept2023,
	remoteRRHeaderLinksTest,
	deeplyReadArticleFooterTest,
	consentlessAds,
	integrateIma,
	billboardsInMerchHigh,
	elementsManager,
	liveblogRightColumnAds,
	publicGoodTest,
	prebidKargo,
];
