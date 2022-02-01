import { isString } from '@guardian/libs';
import fastdom from '../../../../lib/fastdom-promise';
import type { RegisterListener } from '../messenger';

const setType = (adSlotType: string, adSlot: Element) =>
	fastdom.mutate(() => {
		adSlot.classList.add(`ad-slot--${adSlotType}`);
	});

const init = (register: RegisterListener): void => {
	register('type', (specs, ret, iframe) => {
		const adSlot = iframe?.closest('.js-ad-slot');

		if (adSlot && isString(specs)) {
			void setType(specs, adSlot);
		}
	});
};

export { init };
