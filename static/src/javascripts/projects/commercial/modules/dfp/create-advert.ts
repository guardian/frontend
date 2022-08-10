import type { SizeMapping } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { Advert } from './Advert';

const createAdvert = (
	adSlot: HTMLElement,
	additionalSizes?: SizeMapping,
): Advert | null => {
	try {
		const advert = new Advert(adSlot, additionalSizes);
		return advert;
	} catch {
		log(
			'commercial',
			`Could not create advert. Ad slot: ${
				adSlot.id
			}. Additional Sizes: ${JSON.stringify(additionalSizes)}`,
		);

		return null;
	}
};

export { createAdvert };
