import type { SizeMapping } from '@guardian/commercial-core';
import { adSizes } from '@guardian/commercial-core';
import { toGoogleTagSize } from 'common/modules/commercial/lib/googletag-ad-size';
import { _, defineSlot } from './define-slot';

const { buildGoogletagSizeMapping, collectSizes } = _;

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

describe('buildGoogletagSizeMapping', () => {
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
		const result = buildGoogletagSizeMapping(sizeMapping as SizeMapping);

		expect(result).toEqual([
			[
				[980, 0],
				[
					toGoogleTagSize(adSizes.mpu),
					'fluid',
					toGoogleTagSize(adSizes.googleCard),
					toGoogleTagSize(adSizes.halfPage),
				],
			],
			[
				[0, 0],
				[
					toGoogleTagSize(adSizes.mpu),
					'fluid',
					toGoogleTagSize(adSizes.googleCard),
					toGoogleTagSize(adSizes.halfPage),
				],
			],
		]);
	});
});

describe('collectSizes', () => {
	const tests: Array<{
		sizeMapping: googletag.SizeMappingArray;
		output: googletag.SingleSize[];
	}> = [
		{
			sizeMapping: [
				[[980, 0], ['fluid']],
				[[0, 0], [[728, 90]]],
			],
			output: ['fluid', [728, 90]],
		},
		{
			sizeMapping: [
				[
					[0, 0],
					[[1, 1], [2, 2], [728, 90], 'fluid'],
				],
			],
			output: [[1, 1], [2, 2], [728, 90], 'fluid'],
		},
		{
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
			output: [[1, 1], [2, 2], [728, 90], [88, 71], 'fluid'],
		},
	];

	it.each(tests)(
		'should return array of sizes',
		({ sizeMapping, output }) => {
			const result = collectSizes(sizeMapping);

			expect(result).toEqual(output);
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
