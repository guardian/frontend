import type { SizeMapping } from '@guardian/commercial-core';
import { adSizes, createAdSize } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { billboardsInMerch } from 'common/modules/experiments/tests/billboards-in-merch';
import { getCurrentBreakpoint } from 'lib/detect-breakpoint';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { removeDisabledSlots } from '../remove-slots';
import type { Advert } from './Advert';
import { createAdvert } from './create-advert';
import { dfpEnv } from './dfp-env';
import { displayAds } from './display-ads';
import { displayLazyAds } from './display-lazy-ads';
import { setupPrebidOnce } from './prepare-prebid';
import { queueAdvert } from './queue-advert';

const decideAdditionalSizes = (adSlot: HTMLElement): SizeMapping => {
	const { contentType } = window.guardian.config.page;
	const { name } = adSlot.dataset;
	if (contentType === 'Gallery' && name?.includes('inline')) {
		return {
			desktop: [adSizes.billboard, createAdSize(900, 250)],
		};
	} else if (
		isInVariantSynchronous(billboardsInMerch, 'variant') &&
		name?.includes('merchandising')
	) {
		return {
			desktop: [adSizes.billboard],
		};
	} else {
		return {};
	}
};

/**
 * Pre-rendered ad slots that were rendered on the page by the server are collected here.
 *
 * For dynamic ad slots that are created at js-runtime, see:
 *  - article-aside-adverts
 *  - article-body-adverts
 *  - liveblog-adverts
 *  - high-merch
 */
const fillAdvertSlots = async (): Promise<void> => {
	// This module has the following strict dependencies. These dependencies must be
	// fulfilled before fillAdvertSlots can execute reliably. The bootstrap
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
		getCurrentBreakpoint() === 'mobile';

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
			const additionalSizes = decideAdditionalSizes(adSlot);
			return createAdvert(adSlot, additionalSizes);
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
