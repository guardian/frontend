import type { Advert } from './Advert';
import { dfpEnv } from './dfp-env';
import { enableLazyLoad } from './lazy-load';
import { loadAdvert } from './load-advert';

const instantLoadAdvertIds = ['dfp-ad--im'];

interface PartitionedAdverts {
	instantLoadAdverts: Advert[];
	lazyLoadAdverts: Advert[];
}

const partitionAdverts = (): PartitionedAdverts => {
	const instantLoadAdverts = [];
	const lazyLoadAdverts = [];
	for (let i = 0; i < dfpEnv.advertsToLoad.length; i++) {
		const currentAdvert = dfpEnv.advertsToLoad[i];
		if (instantLoadAdvertIds.includes(currentAdvert.id)) {
			instantLoadAdverts.push(currentAdvert);
		} else {
			lazyLoadAdverts.push(currentAdvert);
		}
	}
	return {
		instantLoadAdverts,
		lazyLoadAdverts,
	};
};

const displayLazyAds = (): void => {
	window.googletag?.pubads().collapseEmptyDivs();
	window.googletag?.enableServices();

	const { instantLoadAdverts, lazyLoadAdverts } = partitionAdverts();

	// TODO: why do we need this side effect? Can we remove?
	dfpEnv.advertsToLoad = lazyLoadAdverts;

	instantLoadAdverts.forEach(loadAdvert);
	lazyLoadAdverts.forEach(enableLazyLoad);
};

export { displayLazyAds };
