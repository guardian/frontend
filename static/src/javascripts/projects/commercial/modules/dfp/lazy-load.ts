import { log } from '@guardian/libs';
import { once } from 'lodash-es';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialEndOfQuarter2Test } from 'common/modules/experiments/tests/commercial-end-of-quarter-2-test';
import { commercialLazyLoadMarginReloaded } from 'common/modules/experiments/tests/commercial-lazy-load-margin-reloaded';
import type { Advert } from './Advert';
import { dfpEnv } from './dfp-env';
import { getAdvertById } from './get-advert-by-id';
import { loadAdvert, refreshAdvert } from './load-advert';

const lazyLoadMargins = {
	'variant-1': '0%',
	'variant-2': '10%',
	'variant-3': '20%',
	'variant-4': '30%',
	'variant-5': '40%',
	'variant-6': '50%',
	'variant-7': '60%',
	'variant-8': '70%',
} as const;

type LazyLoadMarginTestVariant = keyof typeof lazyLoadMargins;

const decideLazyLoadMargin = () => {
	const enableNewLazyLoadMargin = !isInVariantSynchronous(
		commercialEndOfQuarter2Test,
		'control',
	);

	const lazyLoadMarginReloadedTestVariant = Object.keys(lazyLoadMargins).find(
		(variantName) => {
			return isInVariantSynchronous(
				commercialLazyLoadMarginReloaded,
				variantName,
			);
		},
	) as LazyLoadMarginTestVariant | undefined;

	let lazyLoadMargin;

	if (lazyLoadMarginReloadedTestVariant) {
		lazyLoadMargin = lazyLoadMargins[lazyLoadMarginReloadedTestVariant];
	} else {
		lazyLoadMargin = enableNewLazyLoadMargin ? '20%' : '200px';
	}

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
