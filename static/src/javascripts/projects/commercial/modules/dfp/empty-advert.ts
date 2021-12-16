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

const emptyAdvert = (advert: Advert): void => {
	fastdom.mutate(() => {
		window.googletag.destroySlots([advert.slot]);
		advert.node.remove();
		removeFromDfpEnv(advert);
	});
};

export { emptyAdvert };
