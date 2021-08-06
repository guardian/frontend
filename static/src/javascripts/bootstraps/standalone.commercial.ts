import { EventTimer } from '@guardian/commercial-core';
import { adFreeSlotRemove } from 'commercial/modules/ad-free-slot-remove';
import { init as prepareAdVerification } from 'commercial/modules/ad-verification/prepare-ad-verification';
import { init as initArticleAsideAdverts } from 'commercial/modules/article-aside-adverts';
import { init as initArticleBodyAdverts } from 'commercial/modules/article-body-adverts';
import { initCommentAdverts } from 'commercial/modules/comment-adverts';
import { init as initComscore } from 'commercial/modules/comscore';
import { init as prepareA9 } from 'commercial/modules/dfp/prepare-a9';
import { init as prepareGoogletag } from 'commercial/modules/dfp/prepare-googletag';
import { initPermutive } from 'commercial/modules/dfp/prepare-permutive';
import { init as preparePrebid } from 'commercial/modules/dfp/prepare-prebid';
import { init as initRedplanet } from 'commercial/modules/dfp/redplanet';
import { init as initHighMerch } from 'commercial/modules/high-merch';
import { init as initIpsosMori } from 'commercial/modules/ipsos-mori';
import { init as initLiveblogAdverts } from 'commercial/modules/liveblog-adverts';
import { init as initMobileSticky } from 'commercial/modules/mobile-sticky';
import { paidContainers } from 'commercial/modules/paid-containers';
import { init as initPaidForBand } from 'commercial/modules/paidfor-band';
import { removeDisabledSlots as closeDisabledSlots } from 'commercial/modules/remove-slots';
import { init as setAdTestCookie } from 'commercial/modules/set-adtest-cookie';
import { init as initStickyTopBanner } from 'commercial/modules/sticky-top-banner';
import { init as initThirdPartyTags } from 'commercial/modules/third-party-tags';
import { amIUsed } from 'commercial/sentinel';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import config from 'lib/config';
import reportError from 'lib/report-error';
import { catchErrorsWithContext } from 'lib/robust';
import type { Modules } from './types';

const { isDotcomRendering, page } = window.guardian.config;

const assetsPath = page.frontendAssetsFullURL ?? page.assetsPath;

__webpack_public_path__ = `${assetsPath}javascripts/commercial/`;

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
		['cm-articleAsideAdverts', initArticleAsideAdverts],
		['cm-articleBodyAdverts', initArticleBodyAdverts],
		['cm-liveblogAdverts', initLiveblogAdverts],
		['cm-stickyTopBanner', initStickyTopBanner],
		['cm-paidContainers', paidContainers],
		['cm-paidforBand', initPaidForBand],
		['cm-commentAdverts', initCommentAdverts],
	);
}

/**
 * Load modules that are specific to `frontend`.
 */
const loadFrontendBundle = async (): Promise<void> => {
	if (isDotcomRendering) return void 0;

	const commercialMetrics = await import(
		/* webpackChunkName: "frontend" */
		'commercial/commercial-metrics'
	);

	commercialModules.push(
		['cm-commercial-metrics', commercialMetrics.init], // In DCR, see App.tsx
	);

	return void 0;
};

/**
 * Load modules specific to `dotcom-rendering`.
 * Not sure if this is needed. Currently no separate chunk is created
 * Introduced by @tomrf1
 */
const loadDcrBundle = async (): Promise<void> => {
	if (!isDotcomRendering) return void 0;

	const userFeatures = await import(
		/* webpackChunkName: "dcr" */
		'common/modules/commercial/user-features'
	);

	commercialModules.push(
		['c-user-features', userFeatures.refresh], // In DCR, see App.tsx
	);
	return void 0;
};

/**
 * Load commercial modules that are used in hosted pages
 */
const loadHostedBundle = async (): Promise<void> => {
	if (!config.get('page.isHosted')) return void 0;

	amIUsed('commercial.dcr.ts', 'loadHostedBundle', { isHosted: 'true' });

	const hostedAbout = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/about'
	);
	const initHostedVideo = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/video'
	);
	const hostedGallery = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/gallery'
	);
	const initHostedCarousel = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/onward-journey-carousel'
	);
	const loadOnwardComponent = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/onward'
	);

	commercialModules.push(
		['cm-hostedAbout', hostedAbout.init],
		['cm-hostedVideo', initHostedVideo.initHostedVideo],
		['cm-hostedGallery', hostedGallery.init],
		['cm-hostedOnward', loadOnwardComponent.loadOnwardComponent],
		['cm-hostedOJCarousel', initHostedCarousel.initHostedCarousel],
	);
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
			{
				feature: 'commercial',
			},
		);
	});

	return Promise.all(modulePromises);
};

const bootCommercial = async (): Promise<void> => {
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
		{
			feature: 'commercial',
		},
	);

	// Stub the command queue
	// @ts-expect-error -- it’s a stub, not the whole Googletag object
	window.googletag = {
		cmd: [],
	};

	try {
		await loadFrontendBundle();
		await loadDcrBundle();
		await loadHostedBundle();
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
			{
				feature: 'commercial',
			},
		);
	} catch (error) {
		// report async errors in bootCommercial to Sentry with the commercial feature tag
		reportError(
			error,
			{
				feature: 'commercial',
			},
			false,
		);
	}
};

if (window.guardian.mustardCut || window.guardian.polyfilled) {
	void bootCommercial();
} else {
	window.guardian.queue.push(bootCommercial);
}
