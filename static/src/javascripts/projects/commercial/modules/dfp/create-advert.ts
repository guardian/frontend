import type { SizeMapping } from '@guardian/commercial/core';
import { log } from '@guardian/libs';
import { reportError } from '../../../../lib/report-error';
import { Advert } from './Advert';

const createAdvert = (
	adSlot: HTMLElement,
	additionalSizes?: SizeMapping,
): Advert | null => {
	try {
		const advert = new Advert(adSlot, additionalSizes);
		return advert;
	} catch (error) {
		const errMsg = `Could not create advert. Ad slot: ${
			adSlot.id
		}. Additional Sizes: ${JSON.stringify(additionalSizes)}. Error: ${
			error instanceof Error ? error.message : 'Unknown error'
		}`;

		log('commercial', errMsg);

		if (!navigator.userAgent.includes('DuckDuckGo')) {
			reportError(
				new Error(errMsg),
				{
					feature: 'commercial',
				},
				false,
				1 / 100,
			);
		}

		return null;
	}
};

export { createAdvert };
