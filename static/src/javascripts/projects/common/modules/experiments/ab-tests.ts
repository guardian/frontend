import type { ABTest } from '@guardian/ab-core';
import { consentOrPayBannerTest } from './tests/consent-or-pay-banner';
import { onwardsContentArticle } from './tests/onwards-content-article';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';
import { UsaExpandableMarketingCard } from './tests/usa-expandable-marketing-card';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	remoteRRHeaderLinksTest,
	UsaExpandableMarketingCard,
	onwardsContentArticle,
	consentOrPayBannerTest
];
