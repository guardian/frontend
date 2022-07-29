import 'lib/dotcom-rendering/public-path';
import { EventTimer } from '@guardian/commercial-core';
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
import { manageAdFreeCookieOnConsentChange } from 'commercial/modules/manage-ad-free-cookie-on-consent-change';
import { init as initMobileSticky } from 'commercial/modules/mobile-sticky';
import { paidContainers } from 'commercial/modules/paid-containers';
import { init as initPaidForBand } from 'commercial/modules/paidfor-band';
import { removeDisabledSlots as closeDisabledSlots } from 'commercial/modules/remove-slots';
import { init as setAdTestCookie } from 'commercial/modules/set-adtest-cookie';
import { init as initThirdPartyTags } from 'commercial/modules/third-party-tags';
import { amIUsed } from 'commercial/sentinel';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { refresh as refreshUserFeatures } from 'common/modules/commercial/user-features';
import config from 'lib/config';
import reportError from 'lib/report-error';
import { catchErrorsWithContext } from 'lib/robust';
import type { Modules } from './types';

const commercialModules: Modules = [
	['cm-setAdTestCookie', setAdTestCookie],
	['cm-manageAdFreeCookieOnConsentChange', manageAdFreeCookieOnConsentChange],
	['cm-closeDisabledSlots', closeDisabledSlots],
	['cm-comscore', initComscore],
	['cm-ipsosmori', initIpsosMori],
	['c-user-features', refreshUserFeatures], // temp fix for DCR @tomrf1
];

if (!commercialFeatures.adFree) {
	commercialModules.push(
		// 'cm-commercial-metrics' is Frontend only.
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
		['cm-paidContainers', paidContainers],
		['cm-paidforBand', initPaidForBand],
		['cm-commentAdverts', initCommentAdverts],
	);
}

const loadHostedBundle = (): Promise<void> => {
	if (config.get('page.isHosted')) {
		amIUsed('commercial.dcr.ts', 'loadHostedBundle', { isHosted: 'true' });
		return new Promise((resolve) => {
			require.ensure(
				[],
				(require) => {
					/* eslint-disable
					 	@typescript-eslint/no-var-requires,
						@typescript-eslint/consistent-type-imports,
						--
						these are chunked by webpack */
					const hostedAbout =
						require('commercial/modules/hosted/about') as typeof import('commercial/modules/hosted/about');
					const initHostedVideo =
						require('commercial/modules/hosted/video') as typeof import('commercial/modules/hosted/video');
					const hostedGallery =
						require('commercial/modules/hosted/gallery') as typeof import('commercial/modules/hosted/gallery');
					const initHostedCarousel =
						require('commercial/modules/hosted/onward-journey-carousel') as typeof import('commercial/modules/hosted/onward-journey-carousel');
					const loadOnwardComponent =
						require('commercial/modules/hosted/onward') as typeof import('commercial/modules/hosted/onward');
					/* eslint-enable
						@typescript-eslint/no-var-requires,
						@typescript-eslint/consistent-type-imports,
						*/

					commercialModules.push(
						['cm-hostedAbout', hostedAbout.init],
						['cm-hostedVideo', initHostedVideo.initHostedVideo],
						['cm-hostedGallery', hostedGallery.init],
						[
							'cm-hostedOnward',
							loadOnwardComponent.loadOnwardComponent,
						],
						[
							'cm-hostedOJCarousel',
							initHostedCarousel.initHostedCarousel,
						],
					);
					resolve();
				},
				'commercial-hosted',
			);
		});
	}
	return Promise.resolve();
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

const bootCommercial = (): Promise<void> => {
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

	return loadHostedBundle()
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
				{
					feature: 'commercial',
				},
			);
		})
		.catch((err) => {
			// report async errors in bootCommercial to Sentry with the commercial feature tag
			reportError(
				err,
				{
					feature: 'commercial',
				},
				false,
			);
		});
};

if (window.guardian.mustardCut || window.guardian.polyfilled) {
	void bootCommercial();
} else {
	window.guardian.queue.push(bootCommercial);
}
