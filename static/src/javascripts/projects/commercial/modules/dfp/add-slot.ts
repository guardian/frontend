import type { SizeMapping } from '@guardian/commercial-core';
import { Advert } from './Advert';
import { dfpEnv } from './dfp-env';
import { enableLazyLoad } from './lazy-load';
import { loadAdvert } from './load-advert';
import { queueAdvert } from './queue-advert';

const displayAd = (
	adSlot: HTMLElement,
	forceDisplay: boolean,
	additionalSizes?: SizeMapping,
) => {
	try {
		const advert = new Advert(adSlot, additionalSizes);

		dfpEnv.advertIds[advert.id] = dfpEnv.adverts.push(advert) - 1;
		if (dfpEnv.shouldLazyLoad() && !forceDisplay) {
			queueAdvert(advert);
			enableLazyLoad(advert);
		} else {
			loadAdvert(advert);
		}
	} catch {
		// TODO: Log using Raven here?? Include slot id in report.
		// Should we include the invalid mappings so that we can investigate?
		console.log('Could not create advert');
		return;
	}
};

const addSlot = (
	adSlot: HTMLElement,
	forceDisplay: boolean,
	additionalSizes?: SizeMapping,
): void => {
	window.googletag.cmd.push(() => {
		if (!(adSlot.id in dfpEnv.advertIds)) {
			// dynamically add ad slot
			displayAd(adSlot, forceDisplay, additionalSizes);
		}
	});
};

export { addSlot };
