/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

/* eslint-disable import/first -- variables must be available to be used when the mock is hoisted before the imports by jest */
const slots = {
	'mobile-only-slot': {
		mobile: [[300, 50]],
	},
	slot: {
		mobile: [
			[300, 50],
			[320, 50],
		],
		tablet: [[728, 90]],
		desktop: [
			[728, 90],
			[900, 250],
			[970, 250],
		],
	},
};

import { slotSizeMappings } from '@guardian/commercial-core';
import type * as CommercialCore from '@guardian/commercial-core';
import { _, Advert } from './Advert';
/* eslint-enable import/first */

type MockCommercialCore = {
	slotSizeMappings: Record<string, unknown>;
};

const { getSlotSizeMapping } = _;

jest.mock('../../../../lib/raven');
jest.mock('ophan/ng', () => null);

jest.mock('@guardian/commercial-core', (): MockCommercialCore => {
	const commercialCore: typeof CommercialCore = jest.requireActual(
		'@guardian/commercial-core',
	);
	return {
		...commercialCore,
		slotSizeMappings: {
			...commercialCore.slotSizeMappings,
			...slots,
		},
	};
});

describe('Advert', () => {
	let googleSlot: googletag.Slot;

	beforeEach(() => {
		let sizesArray: googletag.SizeMappingArray = [];

		const sizeMapping = {
			sizes: sizesArray,
			addSize: jest.fn((width, sizes) => {
				sizesArray.unshift([width, sizes]);
			}),
			build: jest.fn(() => {
				const tmp = sizesArray;
				sizesArray = [];
				return tmp;
			}),
		} as unknown as googletag.SizeMappingBuilder;

		//@ts-expect-error - it is a partial mock
		googleSlot = {
			defineSizeMapping: jest.fn(() => googleSlot),
			setSafeFrameConfig: jest.fn(() => googleSlot),
			setTargeting: jest.fn(() => googleSlot),
			addService: jest.fn(() => googleSlot),
		};

		const partialGoogletag: Partial<typeof googletag> = {
			pubads() {
				return {} as googletag.PubAdsService;
			},
			sizeMapping() {
				return sizeMapping;
			},
			defineSlot() {
				return googleSlot;
			},
		};

		// @ts-expect-error -- we’re making it a partial
		window.googletag = partialGoogletag;
	});

	it('should enable safeframe to expand in the top-above-nav slot', () => {
		const slot = document.createElement('div');
		slot.setAttribute('data-name', 'top-above-nav');
		const ad = new Advert(slot);
		expect(ad).toBeDefined();
		expect(googleSlot.setSafeFrameConfig).toBeCalledWith({
			allowOverlayExpansion: false,
			allowPushExpansion: true,
			sandbox: true,
		});
	});

	it('should enable safeframe to expand in the inline1 slot', () => {
		const slot = document.createElement('div');
		slot.setAttribute('data-name', 'inline1');
		const ad = new Advert(slot);
		expect(ad).toBeDefined();
		expect(googleSlot.setSafeFrameConfig).toBeCalledWith({
			allowOverlayExpansion: false,
			allowPushExpansion: true,
			sandbox: true,
		});
	});

	it('should not enable safeframe to expand in a slot that cannot take outstream ads', () => {
		const slot = document.createElement('div');
		slot.setAttribute('data-name', 'inline2');
		const ad = new Advert(slot);
		expect(ad).toBeDefined();
		expect(googleSlot.setSafeFrameConfig).not.toBeCalled();
	});

	it('should throw an error if no size mappings are found or passed in', () => {
		const slot = document.createElement('div');
		slot.setAttribute('data-name', 'bad-slot');
		const createAd = () => new Advert(slot);
		expect(createAd).toThrow(
			`Tried to render ad slot 'bad-slot' without any size mappings`,
		);
	});
});

describe('getAdSizeMapping', () => {
	it.each(['slot', 'mobile-only-slot'])(
		'getAdSizeMapping(%s) should get the size mapping',
		(slotName) => {
			expect(getSlotSizeMapping(slotName)).toEqual(
				slots[slotName as keyof typeof slots],
			);
		},
	);

	it.each(['inline1', 'inline10', ...Object.keys(slotSizeMappings)])(
		'getAdSizeMapping(%s) should get the size mapping for real slots',
		(value) => {
			const slotName = /inline\d+/.test(value)
				? 'inline'
				: (value as CommercialCore.SlotName);
			expect(getSlotSizeMapping(value)).toEqual(
				slotSizeMappings[slotName],
			);
		},
	);
});
