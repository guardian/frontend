import { adSizes, createAdSize } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { getBreakpoint } from '../../../../lib/detect';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { removeDisabledSlots } from '../remove-slots';
import { Advert } from './Advert';
import { dfpEnv } from './dfp-env';
import { displayAds } from './display-ads';
import { displayLazyAds } from './display-lazy-ads';
import { setupPrebidOnce } from './prepare-prebid';
import { queueAdvert } from './queue-advert';

// Pre-rendered ad slots that were rendered on the page by the server are collected here.
// For dynamic ad slots that are created at js-runtime, see:
//  article-aside-adverts
//  article-body-adverts
//  liveblog-adverts
//  high-merch
const fillAdvertSlots = async (): Promise<void> => {
	// This module has the following strict dependencies. These dependencies must be
	// fulfilled before fillAdvertSlots can execute reliably. The bootstrap (commercial.js)
	// initiates these dependencies, to speed up the init process. Bootstrap also captures the module performance.
	const dependencies: Array<Promise<void>> = [removeDisabledSlots()];

	await Promise.all(dependencies);

	// Prebid might not load if it does not have consent
	// TODO: use Promise.allSettled, once we have Node 12
	await setupPrebidOnce().catch((reason) =>
		log('commercial', 'could not load Prebid.js', reason),
	);

	// Quit if ad-free
	if (commercialFeatures.adFree) {
		return Promise.resolve();
	}

	const isDCRMobile =
		window.guardian.config.isDotcomRendering &&
		getBreakpoint() === 'mobile';
	// Get all ad slots
	const adverts = [
		...document.querySelectorAll<HTMLElement>(dfpEnv.adSlotSelector),
	]
		.filter((adSlot) => !(adSlot.id in dfpEnv.advertIds))
		// TODO: find cleaner workaround
		// we need to not init top-above-nav on mobile view in DCR
		// as the DOM element needs to be removed and replaced to be inline
		// refer to: 3562dc07-78e9-4507-b922-78b979d4c5cb
		.filter(
			(adSlot) => !(isDCRMobile && adSlot.id === 'dfp-ad--top-above-nav'),
		)
		.map((adSlot) => {
			let additionalSizes = {};

			if (
				window.guardian.config.page.contentType === 'Gallery' &&
				adSlot.dataset.name?.includes('inline')
			) {
				additionalSizes = {
					desktop: [adSizes.billboard, createAdSize(900, 250)],
				};
			}

			try {
				const advert = new Advert(adSlot, additionalSizes);
				return advert;
			} catch {
				log(
					'commercial',
					`Could not create advert. Ad slot: ${adSlot.id}`,
				);
				return null;
			}
		})
		.filter((advert): advert is Advert => advert !== null);

	const currentLength = dfpEnv.adverts.length;
	dfpEnv.adverts = dfpEnv.adverts.concat(adverts);
	adverts.forEach((advert, index) => {
		dfpEnv.advertIds[advert.id] = currentLength + index;
	});
	adverts.forEach(queueAdvert);
	if (dfpEnv.shouldLazyLoad()) {
		displayLazyAds();
	} else {
		displayAds();
	}
};

export { fillAdvertSlots };
