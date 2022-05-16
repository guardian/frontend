/**
 * This file is deprecated. Only used for “Hosted” pages
 * All other pages use the standalone bundle.
 */

import { EventTimer } from '@guardian/commercial-core';
import { initAdblockAsk } from 'commercial/adblock-ask';
import { init as initCommercialMetrics } from 'commercial/commercial-metrics';
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
import { manageAdFreeCookieOnConsentChange } from 'commercial/modules/maybe-remove-ad-slot';
import { init as initMobileSticky } from 'commercial/modules/mobile-sticky';
import { paidContainers } from 'commercial/modules/paid-containers';
import { init as initPaidForBand } from 'commercial/modules/paidfor-band';
import { removeDisabledSlots as closeDisabledSlots } from 'commercial/modules/remove-slots';
import { init as setAdTestCookie } from 'commercial/modules/set-adtest-cookie';
import { init as initStickyTopBanner } from 'commercial/modules/sticky-top-banner';
import { init as initThirdPartyTags } from 'commercial/modules/third-party-tags';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import reportError from 'lib/report-error';
import { catchErrorsWithContext } from 'lib/robust';
import type { Modules } from './types';

const tags = {
	feature: 'commercial',
	bundle: 'hosted',
};

const commercialModules: Modules = [
	['cm-setAdTestCookie', setAdTestCookie],
	['cm-manageAdFreeCookieOnConsentChange', manageAdFreeCookieOnConsentChange],
	['cm-closeDisabledSlots', closeDisabledSlots],
	['cm-comscore', initComscore],
	['cm-ipsosmori', initIpsosMori],
];

if (!commercialFeatures.adFree) {
	commercialModules.push(
		['cm-commercial-metrics', initCommercialMetrics], // In DCR, see App.tsx
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
		['rr-adblock-ask', initAdblockAsk],
	);
}

const loadHostedModules = async () => {
	if (!window.guardian.config.page.isHosted) return; // should never happen

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

	return;
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

export const bootCommercial = (): Promise<void> => {
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

	return loadHostedModules()
		.then(loadModules)
		.then(() => {
			catchErrorsWithContext(
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
		})
		.catch((err) => {
			// report async errors in bootCommercial to Sentry with the commercial feature tag
			reportError(err, tags, false);
		});
};
