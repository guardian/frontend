/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { partition } from '../../../../lib/partition';
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
};

export { displayLazyAds };
