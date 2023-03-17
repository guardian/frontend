/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import fastdom from 'fastdom';
import type { Advert } from './Advert';
import { dfpEnv } from './dfp-env';

const removeFromDfpEnv = (advert: Advert) => {
	const removeAdvert = (adverts: Advert[]) =>
		adverts.filter((_) => _ !== advert);

	dfpEnv.adverts = removeAdvert(dfpEnv.adverts);
	dfpEnv.advertsToRefresh = removeAdvert(dfpEnv.advertsToRefresh);
	dfpEnv.advertsToLoad = removeAdvert(dfpEnv.advertsToLoad);
	dfpEnv.advertIds = {};
	dfpEnv.adverts.forEach((ad, i) => {
		dfpEnv.advertIds[ad.id] = i;
	});
};

const removeAd = (advert: Advert) => {
	const parent: HTMLElement | null = advert.node.parentElement;

	if (parent?.classList.contains('ad-slot-container')) {
		parent.remove();
	} else {
		advert.node.remove();
	}
};

const emptyAdvert = (advert: Advert): void => {
	fastdom.mutate(() => {
		window.googletag.destroySlots([advert.slot]);
		removeAd(advert);
		removeFromDfpEnv(advert);
	});
};

export { emptyAdvert };
