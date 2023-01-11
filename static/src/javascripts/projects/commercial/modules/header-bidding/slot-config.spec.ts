import type { SizeMapping } from '@guardian/commercial-core';
import { adSizes } from '@guardian/commercial-core';
import { Advert } from '../dfp/Advert';
import { getHeaderBiddingAdSlots } from './slot-config';
import { getBreakpointKey, shouldIncludeMobileSticky } from './utils';
import type * as Utils from './utils';

jest.mock('lib/raven');

jest.mock('./utils', () => {
	const original: typeof Utils = jest.requireActual('./utils');
	return {
		...original,
		getBreakpointKey: jest.fn(),
		shouldIncludeMobileSticky: jest.fn(),
	};
});

jest.mock('../../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(
		(testId, variantId) => variantId === 'variant',
	),
}));

jest.mock('../../../../lib/cookies', () => ({
	getCookie: jest.fn(),
}));

const slotPrototype = {
	fake: 'slot',
	defineSizeMapping: () => slotPrototype,
	addService: () => slotPrototype,
	setTargeting: () => slotPrototype,
	setSafeFrameConfig: () => slotPrototype,
};

// Mock window.googletag
window.googletag = {
	sizeMapping: () => ({
		// @ts-expect-error these are just mocks
		addSize: () => {
			/* Do nothing*/
		},
		build: () => [],
	}),
	// @ts-expect-error these are just mocks
	defineSlot: () => ({ ...slotPrototype }),
	// @ts-expect-error these are just mocks
	pubads: () => ({}),
};

const buildAdvert = (name: string, sizes?: SizeMapping, id?: string) => {
	const elt = document.createElement('div');
	elt.setAttribute('id', id ?? `dfp-ad--${name}`);
	elt.setAttribute('data-name', name);
	return new Advert(elt, sizes);
};

describe('getPrebidAdSlots', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	test('should return the correct top-above-nav slot at breakpoint D', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('D');
		expect(getHeaderBiddingAdSlots(buildAdvert('top-above-nav'))).toEqual([
			{
				key: 'top-above-nav',
				sizes: [
					[970, 250],
					[728, 90],
				],
			},
		]);
	});

	test('should return the correct interactive banner slot at breakpoint D', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('D');
		const dfpAdvert = buildAdvert(
			'banner',
			{ mobile: [adSizes.mpu] },
			'dfp-ad--1',
		);
		dfpAdvert.node.setAttribute(
			'class',
			'js-ad-slot ad-slot ad-slot--banner-ad ad-slot--banner-ad-desktop ad-slot--rendered',
		);

		const slotReturned = getHeaderBiddingAdSlots(dfpAdvert)[0];
		expect(slotReturned).toBeDefined();
		expect(slotReturned).toMatchObject({
			key: 'banner',
		});
	});

	test('should return the correct top-above-nav slot at breakpoint T', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('T');
		expect(getHeaderBiddingAdSlots(buildAdvert('top-above-nav'))).toEqual([
			{
				key: 'top-above-nav',
				sizes: [[728, 90]],
			},
		]);
	});

	test('should return the correct top-above-nav slot at breakpoint M', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('M');
		expect(getHeaderBiddingAdSlots(buildAdvert('top-above-nav'))).toEqual([
			{
				key: 'top-above-nav',
				sizes: [[300, 250]],
			},
		]);
	});

	test('should return the correct mobile-sticky slot at breakpoint M', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('M');
		window.guardian.config.switches.mobileStickyPrebid = true;
		(shouldIncludeMobileSticky as jest.Mock).mockReturnValue(true);
		expect(
			getHeaderBiddingAdSlots(
				buildAdvert('mobile-sticky', { mobile: [adSizes.mpu] }),
			),
		).toEqual([
			{
				key: 'mobile-sticky',
				sizes: [[320, 50]],
			},
		]);
	});

	test('should return the correct inline1 slot at breakpoint D with no additional size mappings', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('D');
		window.guardian.config.page.contentType = 'Article';

		const hbSlots = getHeaderBiddingAdSlots(buildAdvert('inline1'));
		expect(hbSlots).toHaveLength(1);
		expect(hbSlots[0].sizes).toEqual([
			[300, 250],
			[620, 350],
		]);
	});

	test('should return the correct inline1 slot at breakpoint M with no additional size mappings', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('M');
		window.guardian.config.page.contentType = 'Article';

		const hbSlots = getHeaderBiddingAdSlots(buildAdvert('inline1'));
		expect(hbSlots).toHaveLength(1);
		expect(hbSlots[0].sizes).toEqual([
			[300, 197],
			[300, 250],
			[320, 480],
		]);
	});

	test('should return the correct inline2 slot at breakpoint D with no additional size mappings', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('D');
		window.guardian.config.page.contentType = 'Article';

		const hbSlots = getHeaderBiddingAdSlots(buildAdvert('inline2'));
		expect(hbSlots).toHaveLength(1);
		expect(hbSlots[0].sizes).toEqual([
			[160, 600],
			[300, 600],
			[300, 250],
		]);
	});

	test('should return the correct inline2 slot at breakpoint M with no additional size mappings', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('M');
		window.guardian.config.page.contentType = 'Article';

		const hbSlots = getHeaderBiddingAdSlots(buildAdvert('inline2'));
		expect(hbSlots).toHaveLength(1);
		expect(hbSlots[0].sizes).toEqual([
			[300, 250],
			[320, 480],
		]);
	});

	test('should return the correct inline slot at breakpoint M when inline is in size mappings', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('M');
		window.guardian.config.page.contentType = 'Article';
		const hbSlots = getHeaderBiddingAdSlots(buildAdvert('inline4'));

		expect(hbSlots).toContainEqual(
			expect.objectContaining({ key: 'inline', sizes: [[300, 250]] }),
		);
	});

	test('should return the correct inline slot at breakpoint D with no additional size mappings', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('D');
		window.guardian.config.page.contentType = 'Article';

		const hbSlots = getHeaderBiddingAdSlots(buildAdvert('inline4'));
		expect(hbSlots).toHaveLength(1);
		expect(hbSlots[0].sizes).toEqual([[300, 250]]);
	});

	test('should return the correct inline slot at breakpoint D with additional size mappings', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('D');
		window.guardian.config.page.contentType = 'Article';

		const hbSlots = getHeaderBiddingAdSlots(
			buildAdvert('inline4', {
				desktop: [adSizes.halfPage, adSizes.skyscraper],
			}),
		);
		expect(hbSlots).toHaveLength(1);
		expect(hbSlots[0].sizes).toEqual([
			[160, 600],
			[300, 600],
			[300, 250],
		]);
	});
});
