import type { SizeMapping } from '@guardian/commercial-core';
import { adSizes } from '@guardian/commercial-core';
import { _, defineSlot, getSizeOpts } from './define-slot';

const { buildSizeMapping } = _;

beforeEach(() => {
	const pubAds = {
		setTargeting: jest.fn(),
	};

	type MockSizeMappingBuilder = googletag.SizeMappingBuilder & {
		sizes: googletag.SizeMappingArray;
	};

	const sizeMapping: MockSizeMappingBuilder = {
		sizes: [],
		addSize: jest.fn(function (this: MockSizeMappingBuilder, width, sizes) {
			this.sizes.unshift([width, sizes]);
			return this;
		}),
		build: jest.fn(function (this: MockSizeMappingBuilder) {
			const tmp = this.sizes;
			this.sizes = [];
			return tmp;
		}),
	};

	window.googletag = {
		/* @ts-expect-error -- no way to override types */
		defineSlot: jest.fn(() => window.googletag),
		defineSizeMapping: jest.fn(() => window.googletag),
		addService: jest.fn(() => window.googletag),
		setTargeting: jest.fn(),
		/* @ts-expect-error -- no way to override types */
		pubads() {
			return pubAds;
		},
		sizeMapping() {
			return sizeMapping;
		},
	};
});

describe('buildSizeMapping', () => {
	it('should return googletag size mappings', () => {
		const sizeMapping = {
			mobile: [
				adSizes.mpu,
				adSizes.fluid,
				adSizes.googleCard,
				adSizes.halfPage,
			],
			desktop: [
				adSizes.mpu,
				adSizes.fluid,
				adSizes.googleCard,
				adSizes.halfPage,
			],
		};
		const result = buildSizeMapping(sizeMapping);

		expect(result).toEqual([
			[
				[980, 0],
				[adSizes.mpu, 'fluid', adSizes.googleCard, adSizes.halfPage],
			],
			[
				[0, 0],
				[adSizes.mpu, 'fluid', adSizes.googleCard, adSizes.halfPage],
			],
		]);
	});
});

describe('getSizeOpts', () => {
	it.each([
		{
			sizeMapping: {
				mobile: [[728, 90]],
				desktop: ['fluid'],
			},
			output: {
				sizeMapping: [
					[[980, 0], ['fluid']],
					[[0, 0], [[728, 90]]],
				],
				sizes: ['fluid', [728, 90]],
			},
		},
		{
			sizeMapping: {
				mobile: [
					[1, 1],
					[2, 2],
					[728, 90],
					[0, 0],
				],
			},
			output: {
				sizeMapping: [
					[
						[0, 0],
						[[1, 1], [2, 2], [728, 90], 'fluid'],
					],
				],
				sizes: [[1, 1], [2, 2], [728, 90], 'fluid'],
			},
		},
		{
			sizeMapping: {
				mobile: [
					[1, 1],
					[2, 2],
					[728, 90],
					[0, 0],
				],
				desktop: [
					[1, 1],
					[2, 2],
					[728, 90],
					[88, 71],
					[0, 0],
				],
			},
			output: {
				sizeMapping: [
					[
						[980, 0],
						[[1, 1], [2, 2], [728, 90], [88, 71], 'fluid'],
					],
					[
						[0, 0],
						[[1, 1], [2, 2], [728, 90], 'fluid'],
					],
				],
				sizes: [[1, 1], [2, 2], [728, 90], [88, 71], 'fluid'],
			},
		},
	])(
		'should return googletag size mappings and sizes',
		({ sizeMapping, output }) => {
			const result = getSizeOpts(sizeMapping as SizeMapping);
			expect(result.sizeMapping).toEqual(output.sizeMapping);

			expect(result.sizes).toEqual(output.sizes);
		},
	);
});

describe('Define Slot', () => {
	it('should call defineSlot with correct params', () => {
		const slotDiv = document.createElement('div');
		slotDiv.id = 'dfp-ad--top-above-nav';
		slotDiv.setAttribute('name', 'top-above-nav');

		const topAboveNavSizes = {
			tablet: [
				[1, 1],
				[2, 2],
				[728, 90],
				[88, 71],
				[0, 0],
			],
			desktop: [
				[1, 1],
				[2, 2],
				[728, 90],
				[940, 230],
				[900, 250],
				[970, 250],
				[88, 71],
				[0, 0],
			],
		};

		defineSlot(slotDiv, topAboveNavSizes as SizeMapping);

		expect(window.googletag.defineSlot).toHaveBeenCalledWith(
			undefined,
			[
				[1, 1],
				[2, 2],
				[728, 90],
				[940, 230],
				[900, 250],
				[970, 250],
				[88, 71],
				'fluid',
			],
			'dfp-ad--top-above-nav',
		);
	});
});
