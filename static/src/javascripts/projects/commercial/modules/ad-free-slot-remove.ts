import { once } from 'lodash-es';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { removeSlots } from './remove-slots';

/**
 * If the user is ad-free, remove all ad slots on the page,
 * as the ad slots are still left on the page on fronts, and mostpop on articles
 */
const adFreeSlotRemove = once(() => {
	if (!commercialFeatures.adFree) {
		return Promise.resolve();
	}

	return removeSlots();
});

export { adFreeSlotRemove };
