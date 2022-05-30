import { log } from '@guardian/libs';
import { once } from 'lodash-es';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialEndOfQuarter2Test } from 'common/modules/experiments/tests/commercial-end-of-quarter-2-test';
import type { Advert } from './Advert';
import { dfpEnv } from './dfp-env';
import { getAdvertById } from './get-advert-by-id';
import { loadAdvert, refreshAdvert } from './load-advert';

const decideLazyLoadMargin = () => {
	const enableNewLazyLoadMargin = !isInVariantSynchronous(
		commercialEndOfQuarter2Test,
		'control',
	);

	const lazyLoadMargin = enableNewLazyLoadMargin ? '20%' : '200px';
	log('commercial', `Using lazy load margin of ${lazyLoadMargin}`);

	return lazyLoadMargin;
};

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
	return Promise.resolve(
		new window.IntersectionObserver(onIntersect, {
			rootMargin: `${decideLazyLoadMargin()} 0px`,
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
