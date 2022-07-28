import type { SizeMapping } from '@guardian/commercial-core';
import { adSizes } from '@guardian/commercial-core';
import config from '../../../../lib/config';
import { Advert } from '../dfp/Advert';
import { _, getHeaderBiddingAdSlots } from './slot-config';
import { getBreakpointKey, shouldIncludeMobileSticky } from './utils';
import type * as Utils from './utils';

jest.mock('lib/raven');

const { getSlots } = _;

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

jest.mock('../../../../lib/detect', () => ({
	hasCrossedBreakpoint: jest.fn(),
	isBreakpoint: jest.fn(),
	getBreakpoint: jest.fn(),
	getViewport: jest.fn(),
	hasPushStateSupport: jest.fn(),
	breakpoints: [],
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

const buildAdvert = (id: string, sizes?: SizeMapping) => {
	const elt = document.createElement('div');
	elt.setAttribute('id', id);
	elt.setAttribute('data-name', id);
	return new Advert(elt, sizes);
};

describe('getSlots', () => {
	beforeEach(() => {
		config.set('switches.extendedMostPopular', true);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	test('should return the correct slots at breakpoint M without mobile sticky', () => {
		(shouldIncludeMobileSticky as jest.Mock).mockReturnValue(false);
		(getBreakpointKey as jest.Mock).mockReturnValue('M');
		expect(getSlots('Article')).toEqual([
			{
				key: 'right',
				sizes: [
					[300, 600],
					[300, 250],
				],
			},
			{
				key: 'top-above-nav',
				sizes: [[300, 250]],
			},
			{
				key: 'inline',
				sizes: [[300, 250]],
			},
			{
				key: 'inline1',
				sizes: [
					[300, 197],
					[300, 250],
				],
			},
			{
				key: 'mostpop',
				sizes: [[300, 250]],
			},
		]);
	});

	test('should return the correct slots at breakpoint M for US including mobile sticky slot', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('M');
		config.set('switches.mobileStickyPrebid', true);
		(shouldIncludeMobileSticky as jest.Mock).mockReturnValue(true);
		expect(getSlots('Article')).toEqual([
			{
				key: 'right',
				sizes: [
					[300, 600],
					[300, 250],
				],
			},
			{
				key: 'top-above-nav',
				sizes: [[300, 250]],
			},
			{
				key: 'inline',
				sizes: [[300, 250]],
			},
			{
				key: 'inline1',
				sizes: [
					[300, 197],
					[300, 250],
				],
			},
			{
				key: 'mostpop',
				sizes: [[300, 250]],
			},
			{
				key: 'mobile-sticky',
				sizes: [[320, 50]],
			},
		]);
	});

	test('should return the correct slots at breakpoint T', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('T');
		expect(getSlots('Article')).toEqual([
			{
				key: 'right',
				sizes: [
					[300, 600],
					[300, 250],
				],
			},
			{
				key: 'top-above-nav',
				sizes: [[728, 90]],
			},
			{
				key: 'inline',
				sizes: [[300, 250]],
			},
			{
				key: 'inline1',
				sizes: [
					[300, 250],
					[620, 350],
				],
			},
			{
				key: 'mostpop',
				sizes: [
					[300, 600],
					[300, 250],
					[728, 90],
				],
			},
		]);
	});

	test('should return the correct slots at breakpoint D on article pages', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('D');
		const desktopSlots = getSlots('Article');
		expect(desktopSlots).toContainEqual({
			key: 'inline',
			sizes: [
				[160, 600],
				[300, 600],
				[300, 250],
			],
		});
		expect(desktopSlots).toContainEqual({
			key: 'inline1',
			sizes: [
				[300, 250],
				[620, 350],
			],
		});
		expect(desktopSlots).not.toContainEqual({
			key: 'inline',
			sizes: [[300, 250]],
		});
	});

	test('should return the correct slots at breakpoint T on crossword pages', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('T');
		const tabletSlots = getSlots('Crossword');
		expect(tabletSlots).toContainEqual({
			key: 'crossword-banner',
			sizes: [[728, 90]],
		});
	});

	test('should return the correct slots at breakpoint D on other pages', () => {
		(getBreakpointKey as jest.Mock).mockReturnValue('D');
		const desktopSlots = getSlots('');
		expect(desktopSlots).toContainEqual({
			key: 'inline',
			sizes: [[300, 250]],
		});
		expect(desktopSlots).not.toContainEqual({
			key: 'inline',
			sizes: [
				[300, 600],
				[300, 250],
			],
		});
	});
});

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
		const dfpAdvert = buildAdvert('dfp-ad--1', { mobile: [adSizes.mpu] });
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
		config.set('switches.mobileStickyPrebid', true);
		(shouldIncludeMobileSticky as jest.Mock).mockReturnValue(true);
		expect(
			getHeaderBiddingAdSlots(
				buildAdvert('dfp-ad-mobile-sticky', { mobile: [adSizes.mpu] }),
			),
		).toEqual([
			{
				key: 'mobile-sticky',
				sizes: [[320, 50]],
			},
		]);
	});
});
