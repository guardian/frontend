/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import type { RegisterListener } from '@guardian/commercial-core';
import { isString } from '@guardian/libs';
import fastdom from '../../../../lib/fastdom-promise';

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
