import type { SizeMapping } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { Advert } from './Advert';
import { dfpEnv } from './dfp-env';
import { enableLazyLoad } from './lazy-load';
import { loadAdvert } from './load-advert';
import { queueAdvert } from './queue-advert';

const createAdvert = (adSlot: HTMLElement, additionalSizes?: SizeMapping) => {
	try {
		const advert = new Advert(adSlot, additionalSizes);
		return advert;
	} catch {
		log(
			'commercial',
			`Could not create advert. Ad slot: ${
				adSlot.id
			}. Additional Sizes: ${JSON.stringify(additionalSizes)}`,
		);

		return null;
	}
};

const displayAd = (advert: Advert, forceDisplay: boolean) => {
	dfpEnv.advertIds[advert.id] = dfpEnv.adverts.push(advert) - 1;
	if (dfpEnv.shouldLazyLoad() && !forceDisplay) {
		queueAdvert(advert);
		enableLazyLoad(advert);
	} else {
		loadAdvert(advert);
	}
};

const addSlot = (
	adSlot: HTMLElement,
	forceDisplay: boolean,
	additionalSizes?: SizeMapping,
): void => {
	window.googletag.cmd.push(() => {
		if (!(adSlot.id in dfpEnv.advertIds)) {
			const advert = createAdvert(adSlot, additionalSizes);
			if (advert === null) return;

			// dynamically add ad slot
			displayAd(advert, forceDisplay);
		}
	});
};

export { addSlot };
