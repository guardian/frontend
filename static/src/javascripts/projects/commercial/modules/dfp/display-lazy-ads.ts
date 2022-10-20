import { partition } from '../../../../lib/partition';
import { pageSkin } from '../creatives/page-skin';
import { dfpEnv } from './dfp-env';
import { enableLazyLoad } from './lazy-load';
import { loadAdvert } from './load-advert';

const instantLoadAdvertIds = ['dfp-ad--im'];

const displayLazyAds = (): void => {
	window.googletag.pubads().collapseEmptyDivs();
	window.googletag.enableServices();

	const [instantLoadAdverts, lazyLoadAdverts] = partition(
		dfpEnv.advertsToLoad,
		(advert) => instantLoadAdvertIds.includes(advert.id),
	);

	// TODO: why do we need this side effect? Can we remove?
	dfpEnv.advertsToLoad = lazyLoadAdverts;

	instantLoadAdverts.forEach(loadAdvert);
	lazyLoadAdverts.forEach(enableLazyLoad);
	pageSkin();
};

export { displayLazyAds };
