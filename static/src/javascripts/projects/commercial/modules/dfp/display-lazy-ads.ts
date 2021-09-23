import { dfpEnv } from './dfp-env';
import { enableLazyLoad } from './lazy-load';
import { loadAdvert } from './load-advert';

const instantLoadAdvertIds = ['dfp-ad--im'];

const partition = <T>(
	array: T[],
	callback: (e: T, i: number, array: T[]) => boolean,
): [T[], T[]] =>
	array.reduce(
		(result: [T[], T[]], element, i) => {
			callback(element, i, array)
				? result[0].push(element)
				: result[1].push(element);

			return result;
		},
		[[], []],
	);

const displayLazyAds = (): void => {
	window.googletag?.pubads().collapseEmptyDivs();
	window.googletag?.enableServices();

	const [
		instantLoadAdverts,
		lazyLoadAdverts,
	] = partition(dfpEnv.advertsToLoad, (e) =>
		instantLoadAdvertIds.includes(e.id),
	);

	// TODO: why do we need this side effect? Can we remove?
	dfpEnv.advertsToLoad = lazyLoadAdverts;

	instantLoadAdverts.forEach(loadAdvert);
	lazyLoadAdverts.forEach(enableLazyLoad);
};

export { displayLazyAds };
