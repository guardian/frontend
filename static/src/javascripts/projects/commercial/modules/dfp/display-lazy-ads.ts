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
			// Values TBD
			// Fetch slots within 5 viewports.
			fetchMarginPercent: 100,
			// Render slots within 2 viewports.
			renderMarginPercent: 100,
			// Double the above values on mobile, where viewports are smaller
			// and users tend to scroll faster.
			// mobileScaling: 2.0,
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
