import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialGptLazyLoad } from 'common/modules/experiments/tests/commercial-gpt-lazy-load';
import { partition } from '../../../../lib/partition';
import { dfpEnv } from './dfp-env';
import { enableLazyLoad } from './lazy-load';
import { loadAdvert } from './load-advert';

// For users in variant group of commercialGptLazyLoad,
// these ad slots will be be lazy loaded rather than loaded instantly.
// TODO - remove if GPT lazy loading is fully rolled out.
const instantLoadAdvertIds = ['dfp-ad--im'];

const displayLazyAds = (): void => {
	const useGptLazyLoad = isInVariantSynchronous(
		commercialGptLazyLoad,
		'variant',
	);
	if (useGptLazyLoad) {
		window.googletag.pubads().enableLazyLoad({
			// The average mobile and desktop screen size, which we
			// are using as a proxy for viewport height, is 1080px.
			// 200px (the margin value for the control group) is 18.5% of 1080px.
			fetchMarginPercent: 18.5,
			// Fetching and rendering at the same margin
			// simulates control group behavior.
			renderMarginPercent: 18.5,
			// `mobileScaling` property omitted as the average
			// mobile and desktop sizes are the same.
		});
	}

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
