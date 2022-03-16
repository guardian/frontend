import type { ABTest } from '@guardian/ab-core';
import { commercialGptLazyLoad } from './tests/commercial-gpt-lazy-load';
import { remoteRRHeaderLinksTest } from './tests/remote-header-test';
import { signInGateMainControl } from './tests/sign-in-gate-main-control';
import { signInGateMainVariant } from './tests/sign-in-gate-main-variant';
import { spacefinderOkr3RichLinks } from './tests/spacefinder-okr-3-rich-links';
import { spacefinderOkrMegaTest } from './tests/spacefinder-okr-mega-test';

// keep in sync with ab-tests in dotcom-rendering
// https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/experiments/ab-tests.ts
export const concurrentTests: readonly ABTest[] = [
	signInGateMainVariant,
	signInGateMainControl,
	remoteRRHeaderLinksTest,
	spacefinderOkr3RichLinks,
	spacefinderOkrMegaTest,
	commercialGptLazyLoad,
];
