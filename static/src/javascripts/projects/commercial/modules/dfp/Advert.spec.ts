import { _, Advert } from './Advert';

const { filterClasses, createSizeMapping, getAdBreakpointSizes } = _;

jest.mock('../../../../lib/raven');
jest.mock('ophan/ng', () => null);

describe('Filter classes', () => {
	it('should return nil for empty class lists', () => {
		const result = filterClasses([], []);
		expect(result.length).toBe(0);
	});

	it('should return one class to be removed', () => {
		const result = filterClasses(['old-class'], []);
		expect(result.length).toBe(1);
		expect(result).toContain('old-class');
	});

	it('should return nil classes to be removed', () => {
		const result = filterClasses([], ['new-class']);
		expect(result.length).toBe(0);
	});

	it('should remove two unused classes', () => {
		const result = filterClasses(
			['old-class', 'old-class-2', 'old-class-3'],
			['old-class-2'],
		);
		expect(result.length).toBe(2);
		expect(result).toContain('old-class');
		expect(result).toContain('old-class-3');
	});
});

describe('Advert', () => {
	let googleSlot: Partial<googletag.Slot>;

	beforeEach(() => {
		const sizeMapping = {
			sizes: [],
			build: jest.fn(() => []),
		} as Partial<googletag.SizeMappingBuilder>;

		googleSlot = {
			defineSizeMapping: jest.fn(() => googleSlot),
			setSafeFrameConfig: jest.fn(() => googleSlot),
			setTargeting: jest.fn(() => googleSlot),
			addService: jest.fn(() => googleSlot),
		} as Partial<googletag.Slot>;

		// @ts-expect-error - this is a mock so type not totally compatible with Googletag
		window.googletag = {
			pubads() {
				return ({} as unknown) as googletag.PubAdsService;
			},
			sizeMapping() {
				return sizeMapping;
			},
			defineSlot() {
				return googleSlot;
			},
		} as Partial<googletag.Googletag>;
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
});

describe('createSizeMapping', () => {
	it('one size', () => {
		expect(createSizeMapping('300,50')).toEqual([[300, 50]]);
	});
	it('multiple sizes', () => {
		expect(createSizeMapping('300,50|320,50')).toEqual([
			[300, 50],
			[320, 50],
		]);
		expect(createSizeMapping('300,50|320,50|fluid')).toEqual([
			[300, 50],
			[320, 50],
			'fluid',
		]);
	});
});

describe('getAdBreakpointSizes', () => {
	it('none', () => {
		const advertNode = document.createElement('div', {});
		advertNode.setAttribute('data-name', 'name');
		advertNode.setAttribute('data-something', 'something-else');
		expect(getAdBreakpointSizes(advertNode)).toEqual({});
	});

	it('one breakpoint, one size', () => {
		const advertNode = document.createElement('div', {});
		advertNode.setAttribute('data-mobile', '300,50');
		expect(getAdBreakpointSizes(advertNode)).toEqual({
			mobile: [[300, 50]],
		});
	});

	it('one breakpoint, multi-size', () => {
		const advertNode = document.createElement('div', {});
		advertNode.setAttribute('data-mobile', '300,50|320,50');
		expect(getAdBreakpointSizes(advertNode)).toEqual({
			mobile: [
				[300, 50],
				[320, 50],
			],
		});
	});

	it('multiple breakpoints, multi-size', () => {
		const advertNode = document.createElement('div', {});
		advertNode.setAttribute('data-mobile', '300,50|320,50');
		advertNode.setAttribute('data-phablet', '200,200');
		advertNode.setAttribute('data-desktop', '250,250|fluid');
		expect(getAdBreakpointSizes(advertNode)).toEqual({
			mobile: [
				[300, 50],
				[320, 50],
			],
			phablet: [[200, 200]],
			desktop: [[250, 250], 'fluid'],
		});
	});
});
