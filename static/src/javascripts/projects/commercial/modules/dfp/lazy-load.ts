import { EventTimer } from '@guardian/commercial-core';
import { once } from 'lodash-es';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialGptLazyLoad } from 'common/modules/experiments/tests/commercial-gpt-lazy-load';
import { commercialLazyLoadMargin } from 'common/modules/experiments/tests/commercial-lazy-load-margin';
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
/**
 * return a random number between 20 (inclusive) and 420 (non-inclusive)
 * @returns number
 */
const getRandomLazyLoadMargin = (): number => {
	const min = 20;
	const max = 420;
	return Math.floor(Math.random() * (max - min)) + min;
};

const getObserver = once(() => {
	const inLazyLoadMarginTestVariant = isInVariantSynchronous(
		commercialLazyLoadMargin,
		'variant',
	);
	let rootMargin;
	if (inLazyLoadMarginTestVariant) {
		const margin = getRandomLazyLoadMargin();
		const eventTimer = EventTimer.get();
		eventTimer.setProperty('lazyLoadMarginPercent', margin);
		rootMargin = `${margin}% 0px`;
	} else {
		rootMargin = '200px 0px';
	}
	return Promise.resolve(
		new window.IntersectionObserver(onIntersect, {
			rootMargin,
		}),
	);
});

export const enableLazyLoad = (advert: Advert): void => {
	const useGptLazyLoad = isInVariantSynchronous(
		commercialGptLazyLoad,
		'variant',
	);
	const useCustomLazyLoad = dfpEnv.lazyLoadObserve && !useGptLazyLoad;
	if (useCustomLazyLoad) {
		void getObserver().then((observer) => observer.observe(advert.node));
	} else {
		displayAd(advert.id);
	}
};
