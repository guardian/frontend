import { once } from 'lodash-es';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialGptLazyLoad } from 'common/modules/experiments/tests/commercial-gpt-lazy-load';
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

const getObserver = once(() =>
	Promise.resolve(
		new window.IntersectionObserver(onIntersect, {
			rootMargin: '200px 0px',
		}),
	),
);

export const enableLazyLoad = (advert: Advert): void => {
	if (
		dfpEnv.lazyLoadObserve &&
		isInVariantSynchronous(commercialGptLazyLoad, 'variant')
	) {
		window.googletag.pubads().enableLazyLoad();
	} else if (dfpEnv.lazyLoadObserve) {
		void getObserver().then((observer) => observer.observe(advert.node));
	} else {
		displayAd(advert.id);
	}
};
