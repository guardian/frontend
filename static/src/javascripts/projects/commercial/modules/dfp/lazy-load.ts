import { once } from 'lodash-es';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
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

const lazyLoadMargins = {
	'variant-1': 20,
	'variant-2': 70,
	'variant-3': 120,
	'variant-4': 170,
	'variant-5': 220,
	'variant-6': 270,
	'variant-7': 320,
	'variant-8': 370,
} as const;

type LazyLoadMarginTestVariant = keyof typeof lazyLoadMargins;

const getObserver = once(() => {
	const lazyLoadMarginTestVariant = Object.keys(lazyLoadMargins).find(
		(variantName) => {
			return isInVariantSynchronous(
				commercialLazyLoadMargin,
				variantName,
			);
		},
	) as LazyLoadMarginTestVariant | undefined;
	let rootMargin;
	if (lazyLoadMarginTestVariant) {
		const margin = lazyLoadMargins[lazyLoadMarginTestVariant];
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
	if (dfpEnv.lazyLoadObserve) {
		void getObserver().then((observer) => observer.observe(advert.node));
	} else {
		displayAd(advert.id);
	}
};
