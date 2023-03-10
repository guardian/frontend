/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { removeSlots, removeDisabledSlots } from './remove-slots';

const adSlotSelector = '.js-ad-slot';

describe('Remove ad slots and labels', () => {
	afterEach(() => {
		if (document.body) {
			document.body.innerHTML = '';
		}
	});
	test('Remove all ad slots', () => {
		if (document.body) {
			document.body.innerHTML = `
                <div>
                    <div class="js-ad-slot"></div>
                    <div class="js-ad-slot"></div>
                </div>
            `;
		}
		expect(document.querySelectorAll(adSlotSelector).length).toEqual(2);
		return removeSlots().then(() => {
			expect(document.querySelectorAll(adSlotSelector).length).toEqual(0);
		});
	});

	test('Remove all disabled (ie display: none) ad slots', () => {
		if (document.body) {
			document.body.innerHTML = `
                <div>
                    <div style="display: none" class="js-ad-slot"></div>
                    <div class="js-ad-slot"></div>
                </div>
            `;
		}
		expect(document.querySelectorAll(adSlotSelector).length).toEqual(2);
		return removeDisabledSlots().then(() => {
			expect(document.querySelectorAll(adSlotSelector).length).toEqual(1);
		});
	});
});
