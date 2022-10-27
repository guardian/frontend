import type { SizeMapping } from '@guardian/commercial-core';
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
	} catch {
		const errMsg = `Could not create advert. Ad slot: ${
			adSlot.id
		}. Additional Sizes: ${JSON.stringify(additionalSizes)}`;

		log('commercial', errMsg);
		reportError(
			new Error(errMsg),
			{
				feature: 'commercial',
			},
			false,
		);

		return null;
	}
};

export { createAdvert };
