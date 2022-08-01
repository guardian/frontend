/*
 * This standalone bundle is so called because it “stands alone”,
 * meaning it is not part of another webpack build process, and
 * can be imported as a JS <script>.
 *
 * See PR https://github.com/guardian/frontend/pull/24058
 *
 * The standalone commercial bundle is bundled from source files
 * here in Frontend, but is served from https://assets.guim.co.uk
 * in production DCR and Frontend.
 *
 * Changes here will be served on DCR & Frontend rendered pages.
 */

import { EventTimer } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import reportError from '../lib/report-error';
import { catchErrorsWithContext } from '../lib/robust';
import { initAdblockAsk } from '../projects/commercial/adblock-ask';
import { adFreeSlotRemove } from '../projects/commercial/modules/ad-free-slot-remove';
import { init as prepareAdVerification } from '../projects/commercial/modules/ad-verification/prepare-ad-verification';
import { init as initArticleAsideAdverts } from '../projects/commercial/modules/article-aside-adverts';
import { init as initArticleBodyAdverts } from '../projects/commercial/modules/article-body-adverts';
import { initCommentAdverts } from '../projects/commercial/modules/comment-adverts';
import { init as initComscore } from '../projects/commercial/modules/comscore';
import { adSlotIdPrefix } from '../projects/commercial/modules/dfp/dfp-env-globals';
import { init as prepareA9 } from '../projects/commercial/modules/dfp/prepare-a9';
import { init as prepareGoogletag } from '../projects/commercial/modules/dfp/prepare-googletag';
import { initPermutive } from '../projects/commercial/modules/dfp/prepare-permutive';
import { init as preparePrebid } from '../projects/commercial/modules/dfp/prepare-prebid';
import { init as initRedplanet } from '../projects/commercial/modules/dfp/redplanet';
import { init as initHighMerch } from '../projects/commercial/modules/high-merch';
import { init as initIpsosMori } from '../projects/commercial/modules/ipsos-mori';
import { init as initLiveblogAdverts } from '../projects/commercial/modules/liveblog-adverts';
import { manageAdFreeCookieOnConsentChange } from '../projects/commercial/modules/manage-ad-free-cookie-on-consent-change';
import { init as initMobileSticky } from '../projects/commercial/modules/mobile-sticky';
import { paidContainers } from '../projects/commercial/modules/paid-containers';
import { init as initPaidForBand } from '../projects/commercial/modules/paidfor-band';
import { removeDisabledSlots as closeDisabledSlots } from '../projects/commercial/modules/remove-slots';
import { init as setAdTestCookie } from '../projects/commercial/modules/set-adtest-cookie';
import { init as initThirdPartyTags } from '../projects/commercial/modules/third-party-tags';
import { init as initTrackGpcSignal } from '../projects/commercial/modules/track-gpc-signal';
import { init as initTrackScrollDepth } from '../projects/commercial/modules/track-scroll-depth';
import { commercialFeatures } from '../projects/common/modules/commercial/commercial-features';
import type { Modules } from './types';

const { isDotcomRendering, page } = window.guardian.config;

const assetsPath = page.frontendAssetsFullURL ?? page.assetsPath;

__webpack_public_path__ = `${assetsPath}javascripts/commercial/`;

const tags: Record<string, unknown> = {
	feature: 'commercial',
	bundle: 'standalone',
};

// modules necessary to load the first ads on the page
const commercialBaseModules: Modules = [];

// remaining modules not necessary to load an ad
const commercialExtraModules: Modules = [
	['cm-adFreeSlotRemoveFronts', adFreeSlotRemove],
	['cm-manageAdFreeCookieOnConsentChange', manageAdFreeCookieOnConsentChange],
	['cm-closeDisabledSlots', closeDisabledSlots],
	['cm-comscore', initComscore],
	['cm-ipsosmori', initIpsosMori],
	['cm-trackScrollDepth', initTrackScrollDepth],
	['cm-trackGpcSignal', initTrackGpcSignal],
];

if (!commercialFeatures.adFree) {
	commercialBaseModules.push(
		['cm-setAdTestCookie', setAdTestCookie],
		['cm-prepare-prebid', preparePrebid],
		// Permutive init code must run before google tag enableServices()
		// The permutive lib however is loaded async with the third party tags
		['cm-prepare-googletag', () => initPermutive().then(prepareGoogletag)],
		['cm-prepare-a9', prepareA9],
	);
	commercialExtraModules.push(
		['cm-prepare-adverification', prepareAdVerification],
		['cm-mobileSticky', initMobileSticky],
		['cm-highMerch', initHighMerch],
		['cm-articleAsideAdverts', initArticleAsideAdverts],
		['cm-articleBodyAdverts', initArticleBodyAdverts],
		['cm-liveblogAdverts', initLiveblogAdverts],
		['cm-thirdPartyTags', initThirdPartyTags],
		['cm-redplanet', initRedplanet],
		['cm-paidContainers', paidContainers],
		['cm-paidforBand', initPaidForBand],
		['cm-commentAdverts', initCommentAdverts],
		['rr-adblock-ask', initAdblockAsk],
	);
}

/**
 * Load modules specific to `dotcom-rendering`.
 * Not sure if this is needed. Currently no separate chunk is created
 * Introduced by @tomrf1
 */
const loadDcrBundle = async (): Promise<void> => {
	if (!isDotcomRendering) return;

	const userFeatures = await import(
		/* webpackChunkName: "dcr" */
		'common/modules/commercial/user-features'
	);

	commercialExtraModules.push(['c-user-features', userFeatures.refresh]);
	return;
};

const loadModules = (modules: Modules, eventName: string) => {
	const modulePromises: Array<Promise<unknown>> = [];

	modules.forEach((module) => {
		const [moduleName, moduleInit] = module;

		catchErrorsWithContext(
			[
				[
					moduleName,
					function pushAfterComplete(): void {
						const result = moduleInit();
						modulePromises.push(result);
					},
				],
			],
			tags,
		);
	});

	return Promise.allSettled(modulePromises).then(() => {
		EventTimer.get().trigger(eventName);
	});
};

const recordCommercialMetrics = () => {
	const eventTimer = EventTimer.get();
	eventTimer.trigger('commercialModulesLoaded');
	// record the number of ad slots on the page
	const adSlotsTotal = document.querySelectorAll(
		`[id^="${adSlotIdPrefix}"]`,
	).length;
	eventTimer.setProperty('adSlotsTotal', adSlotsTotal);

	// and the number of inline ad slots
	const adSlotsInline = document.querySelectorAll(
		`[id^="${adSlotIdPrefix}inline"]`,
	).length;
	eventTimer.setProperty('adSlotsInline', adSlotsInline);
};

const bootCommercial = async (): Promise<void> => {
	log('commercial', '📦 standalone.commercial.ts', __webpack_public_path__);

	// Init Commercial event timers
	EventTimer.init();

	catchErrorsWithContext(
		[
			[
				'ga-user-timing-commercial-start',
				function runTrackPerformance() {
					EventTimer.get().trigger('commercialStart');
				},
			],
		],
		tags,
	);

	// Stub the command queue
	// @ts-expect-error -- it’s a stub, not the whole Googletag object
	window.googletag = {
		cmd: [],
	};

	try {
		await loadDcrBundle();

		const allModules: Array<Parameters<typeof loadModules>> = [
			[commercialBaseModules, 'commercialBaseModulesLoaded'],
			[commercialExtraModules, 'commercialExtraModulesLoaded'],
		];
		const promises = allModules.map((args) => loadModules(...args));

		await Promise.all(promises).then(recordCommercialMetrics);
	} catch (error) {
		// report async errors in bootCommercial to Sentry with the commercial feature tag
		reportError(error, tags, false);
	}
};

const init = (): void => {
	if (window.guardian.mustardCut || window.guardian.polyfilled) {
		void bootCommercial();
	} else {
		window.guardian.queue.push(bootCommercial);
	}
};

export { init };
