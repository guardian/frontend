import { EventTimer } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { getBreakpoint } from '../lib/detect-viewport';
import reportError from '../lib/report-error';
import { catchErrorsWithContext } from '../lib/robust';
import { initAdblockAsk } from '../projects/commercial/adblock-ask';
import { adFreeSlotRemove } from '../projects/commercial/modules/ad-free-slot-remove';
import { init as prepareAdVerification } from '../projects/commercial/modules/ad-verification/prepare-ad-verification';
import { init as initArticleBodyAdverts } from '../projects/commercial/modules/article-body-adverts';
import { init as initComscore } from '../projects/commercial/modules/comscore';
import { init as prepareA9 } from '../projects/commercial/modules/dfp/prepare-a9';
import { init as prepareGoogletag } from '../projects/commercial/modules/dfp/prepare-googletag';
import { initPermutive } from '../projects/commercial/modules/dfp/prepare-permutive';
import { init as preparePrebid } from '../projects/commercial/modules/dfp/prepare-prebid';
import { init as initRedplanet } from '../projects/commercial/modules/dfp/redplanet';
import { init as initHighMerch } from '../projects/commercial/modules/high-merch';
import { init as initIpsosMori } from '../projects/commercial/modules/ipsos-mori';
import { init as initLiveblogAdverts } from '../projects/commercial/modules/liveblog-adverts';
import { init as initMobileSticky } from '../projects/commercial/modules/mobile-sticky';
import { paidContainers } from '../projects/commercial/modules/paid-containers';
import { init as initPaidForBand } from '../projects/commercial/modules/paidfor-band';
import { removeDisabledSlots as closeDisabledSlots } from '../projects/commercial/modules/remove-slots';
import { init as setAdTestCookie } from '../projects/commercial/modules/set-adtest-cookie';
import { init as initStickyTopBanner } from '../projects/commercial/modules/sticky-top-banner';
import { init as initThirdPartyTags } from '../projects/commercial/modules/third-party-tags';
import { commercialFeatures } from '../projects/common/modules/commercial/commercial-features';
import type { Modules } from './types';

const { isDotcomRendering, page } = window.guardian.config;

const assetsPath = page.frontendAssetsFullURL ?? page.assetsPath;

__webpack_public_path__ = `${assetsPath}javascripts/commercial/`;

const tags: Record<string, unknown> = {
	feature: 'commercial',
	bundle: 'standalone',
};

const commercialModules: Modules = [
	['cm-setAdTestCookie', setAdTestCookie],
	['cm-adFreeSlotRemove', adFreeSlotRemove],
	['cm-closeDisabledSlots', closeDisabledSlots],
	['cm-comscore', initComscore],
	['cm-ipsosmori', initIpsosMori],
];

if (!commercialFeatures.adFree) {
	commercialModules.push(
		['cm-prepare-prebid', preparePrebid],
		['cm-prepare-a9', prepareA9],
		['cm-thirdPartyTags', initThirdPartyTags],
		// Permutive init code must run before google tag enableServices()
		// The permutive lib however is loaded async with the third party tags
		['cm-prepare-googletag', () => initPermutive().then(prepareGoogletag)],
		['cm-redplanet', initRedplanet],
		['cm-prepare-adverification', prepareAdVerification],
		['cm-mobileSticky', initMobileSticky],
		['cm-highMerch', initHighMerch],
		['cm-articleBodyAdverts', initArticleBodyAdverts],
		['cm-liveblogAdverts', initLiveblogAdverts],
		['cm-stickyTopBanner', initStickyTopBanner],
		['cm-paidContainers', paidContainers],
		['cm-paidforBand', initPaidForBand],
		['rr-adblock-ask', initAdblockAsk],
	);
}

/**
 * Load modules that are specific to `frontend`.
 */
const loadFrontendBundle = async (): Promise<void> => {
	if (isDotcomRendering) return;

	const commercialMetrics = await import(
		/* webpackChunkName: "frontend" */
		'../projects/commercial/commercial-metrics'
	);

	commercialModules.push(
		['cm-commercial-metrics', commercialMetrics.init], // In DCR, see App.tsx
	);

	return;
};

/**
 * Load modules specific to `dotcom-rendering`.
 * Not sure if this is needed. Currently no separate chunk is created
 * Introduced by @tomrf1
 */
const loadDcrBundle = async (): Promise<void> => {
	if (!isDotcomRendering) return;

	const userFeatures = await import(
		/* webpackChunkName: "dcr" */
		'../projects/common/modules/commercial/user-features'
	);

	commercialModules.push(['c-user-features', userFeatures.refresh]);
	return;
};

const loadCommentAdverts = async (): Promise<void> => {
	const commentAdverts = await import(
		/* webpackChunkName: "comment-adverts" */
		'../projects/commercial/modules/comment-adverts'
	);
	commercialModules.push([
		'cm-commentAdverts',
		commentAdverts.initCommentAdverts,
	]);
};

/**
 * Article aside rely on the existence of a `.js-secondary-column`, which
 * is a class always applied to elements which have `.content__secondary-column`
 * meaning we can prevent execution on widths below Desktop (`980`).
 *
 * We can also safely ignore this in DCR, as this class is never added there.
 *
 * See: https://github.com/guardian/frontend/blob/23429b39b982879c4aff25f59d7a445f01dfa302/static/src/stylesheets/module/content/_content.scss#L104-L106
 */
const loadArticleAsideAdverts = async (): Promise<void> => {
	if (isDotcomRendering) return;

	const articleAsideAdverts = await import(
		/* webpackChunkName: "article-aside-adverts" */
		'../projects/commercial/modules/article-aside-adverts'
	);
	commercialModules.push([
		'cm-articleAsideAdverts',
		articleAsideAdverts.init,
	]);
};

const loadBreakpointSpecificBundle = async (width: number): Promise<void> => {
	switch (getBreakpoint(width)) {
		case 'wide':
		case 'desktop':
			await loadArticleAsideAdverts();
		// falls through
		case 'tablet':
			await loadCommentAdverts();
		// falls through
		case 'mobile':
			return;
	}
};

const loadModules = () => {
	const modulePromises: Array<Promise<unknown>> = [];

	commercialModules.forEach((module) => {
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

	return Promise.all(modulePromises);
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
		if (isDotcomRendering) {
			await loadDcrBundle();
		} else {
			await loadFrontendBundle();
		}

		await loadBreakpointSpecificBundle(
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- window.innerWidth isn’t supported everywhere
			window.innerWidth ?? document.body.clientWidth ?? 0,
		);

		await loadModules();

		return catchErrorsWithContext(
			[
				[
					'ga-user-timing-commercial-end',
					function runTrackPerformance(): void {
						EventTimer.get().trigger('commercialEnd');
					},
				],
			],
			tags,
		);
	} catch (error) {
		// report async errors in bootCommercial to Sentry with the commercial feature tag
		reportError(error, tags, false);
	}
};

if (window.guardian.mustardCut || window.guardian.polyfilled) {
	void bootCommercial();
} else {
	window.guardian.queue.push(bootCommercial);
}
