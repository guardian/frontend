import { log } from '@guardian/libs';
import { once } from 'lodash-es';
import type { Advert } from './Advert';
import { dfpEnv } from './dfp-env';
import { getAdvertById } from './get-advert-by-id';
import { loadAdvert, refreshAdvert } from './load-advert';

const displayAd = (advertId: string) => {
	const advert = getAdvertById(advertId);
	if (advert) {
		if (advert.isRendered) {
			refreshAdvert(advert);
		} else {
			loadAdvert(advert);
		}
	}
};

const onIntersect = (
	entries: IntersectionObserverEntry[],
	observer: IntersectionObserver,
) => {
	const advertIds: string[] = [];

	entries
		.filter((entry) => !('isIntersecting' in entry) || entry.isIntersecting)
		.forEach((entry) => {
			observer.unobserve(entry.target);
			displayAd(entry.target.id);
			advertIds.push(entry.target.id);
		});

	dfpEnv.advertsToLoad = dfpEnv.advertsToLoad.filter(
		(advert) => !advertIds.includes(advert.id),
	);
};

const getObserver = once(() => {
	const tests = window.guardian.config.tests;
	const isInMegaTestControlGroup =
		tests && !!tests['commercialEndOfQuarterMegaTestControl'];

	const lazyLoadMargin = isInMegaTestControlGroup ? '200px' : '20%';
	log('commercial', 'Using lazy load margin', lazyLoadMargin);

	return Promise.resolve(
		new window.IntersectionObserver(onIntersect, {
			rootMargin: `${lazyLoadMargin} 0px`,
		}),
	);
});

export const enableLazyLoad = (advert: Advert): void => {
	if (dfpEnv.lazyLoadObserve) {
		void getObserver().then((observer) => observer.observe(advert.node));
	} else {
		displayAd(advert.id);
	}
};
