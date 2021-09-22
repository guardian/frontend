import { dfpEnv } from './dfp-env';
import { enableLazyLoad } from './lazy-load';
import { loadAdvert } from './load-advert';

const advertsToInstantlyLoad = ['dfp-ad--im'];

const instantLoad = () => {
	const instantLoadAdverts = dfpEnv.advertsToLoad.filter((advert) =>
		advertsToInstantlyLoad.includes(advert.id),
	);

	dfpEnv.advertsToLoad = dfpEnv.advertsToLoad.filter(
		(advert) => !advertsToInstantlyLoad.includes(advert.id),
	);

	instantLoadAdverts.forEach(loadAdvert);
};

const displayLazyAds = (): void => {
	window.googletag?.pubads().collapseEmptyDivs();
	window.googletag?.enableServices();

	instantLoad();

	dfpEnv.advertsToLoad.forEach((advert) => {
		enableLazyLoad(advert);
	});
};

export { displayLazyAds };
