import type { Advert } from './Advert';
import { dfpEnv } from './dfp-env';

export const queueAdvert = (advert: Advert): void => {
	dfpEnv.advertsToLoad.push(advert);
	// Add to the array of ads to be refreshed (when the breakpoint changes)
	// only if its `data-refresh` attribute isn't set to false.
	if (advert.node.dataset.refresh !== 'false') {
		dfpEnv.advertsToRefresh.push(advert);
	}
};
