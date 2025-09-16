/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 *
 * If you wish to make a change to the Commercial bundle, please visit the equivalent file in that repo.
 * Some source in Frontend still relies on this file (which has been simplified), so in some circumstances may still be edited
 *
 */

import { isAdFreeUser } from '../userFeatures/cookies/adFree';

// Having a constructor means we can easily re-instantiate the object in a test
class CommercialFeatures {
	adFree: boolean;
	youtubeAdvertising: boolean;

	constructor() {
		const forceAdFree = /[#&]noadsaf(&.*)?$/.test(window.location.hash);
		const sensitiveContent =
			window.guardian.config.page.shouldHideAdverts ||
			window.guardian.config.page.section === 'childrens-books-site';

		this.adFree = !!forceAdFree || isAdFreeUser();

		this.youtubeAdvertising = !this.adFree && !sensitiveContent;
	}
}

export const commercialFeatures = new CommercialFeatures();
export type CommercialFeaturesConstructor = typeof CommercialFeatures;
