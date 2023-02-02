import type { ABTest } from '@guardian/ab-core';
import { billboardsInMerch } from './tests/billboards-in-merch';
import { consentlessAds } from './tests/consentlessAds';
import { deeplyReadArticleFooterTest } from './tests/deeply-read-article-footer';
import { integrateIma } from './tests/integrate-ima';
import { liveblogDesktopOutstream } from './tests/liveblog-desktop-outstream';
import { noCarrotAdsNearNewsletterSignupBlocks } from './tests/no-carrot-ads-near-newsletter-signup-blocks';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateCopyTestJan2023 } from './tests/sign-in-gate-copy-test-variant';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';
import { teadsCookieless } from './tests/teads-cookieless';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	signInGateCopyTestJan2023,
	remoteRRHeaderLinksTest,
	deeplyReadArticleFooterTest,
	consentlessAds,
	integrateIma,
	liveblogDesktopOutstream,
	teadsCookieless,
	billboardsInMerch,
	noCarrotAdsNearNewsletterSignupBlocks,
];
