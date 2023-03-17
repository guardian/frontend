/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import type { Advert } from './Advert';
import { onSlotRender } from './on-slot-render';

let advert: Partial<Advert>;

const baseEvent = {
	isEmpty: false,
	slot: {
		getSlotElementId: jest.fn().mockReturnValue('dfp-ad--top-above-nav'),
	},
};

jest.mock('../../../../lib/raven');

jest.mock('./empty-advert');

jest.mock('./render-advert', () => ({
	renderAdvert: jest.fn().mockReturnValue(Promise.resolve(true)),
}));

jest.mock('./get-advert-by-id', () => ({
	getAdvertById: jest.fn().mockImplementation(() => advert),
}));

describe('onSlotRender', () => {
	it('if rendered call set call finishedRendering on the advert', () => {
		const event = { ...baseEvent, size: [300, 250], isEmpty: false };
		advert = {
			id: 'dfp-ad--top-above-nav',
			finishedRendering: (isRendered: boolean) => {
				expect(isRendered).toBe(true);
			},
		};
		// @ts-expect-error - we are mocking the function
		onSlotRender(event);
	});

	it('if not rendered call set call finishedRendering on the advert', () => {
		const event = {
			...baseEvent,
			isEmpty: true,
		};
		advert = {
			id: 'dfp-ad--top-above-nav',
			finishedRendering: (isRendered: boolean) => {
				expect(isRendered).toBe(false);
			},
		};
		// @ts-expect-error - we are mocking the function
		onSlotRender(event);
	});
});
