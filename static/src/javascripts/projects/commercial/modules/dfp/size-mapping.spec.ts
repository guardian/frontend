import { adSizes } from '@guardian/commercial-core';
import { concatSizeMappings, sizeMappingsToString } from './size-mapping';

describe('concatSizeMappings', () => {
	it('different breakpoints', () => {
		expect(
			concatSizeMappings(
				{ mobile: [adSizes.fluid], tablet: [adSizes.portrait] },
				{ phablet: [adSizes.outOfPage], desktop: [adSizes.halfPage] },
			),
		).toEqual({
			mobile: [adSizes.fluid],
			tablet: [adSizes.portrait],
			phablet: [adSizes.outOfPage],
			desktop: [adSizes.halfPage],
		});
	});

	it('merge same breakpoint', () => {
		expect(
			concatSizeMappings(
				{ mobile: [adSizes.fluid] },
				{ mobile: [adSizes.halfPage] },
			),
		).toEqual({
			mobile: [adSizes.fluid, adSizes.halfPage],
		});
	});

	it('merge across multiple breakpoints', () => {
		expect(
			concatSizeMappings(
				{
					mobile: [adSizes.fluid],
					desktop: [adSizes.halfPage, adSizes.mpu],
					tablet: [adSizes.merchandising],
				},
				{
					tablet: [adSizes.merchandisingHigh],
					mobile: [adSizes.halfPage, adSizes.fluid, adSizes.mpu],
					phablet: [adSizes.outOfPage, adSizes.mobilesticky],
				},
			),
		).toEqual({
			mobile: [
				adSizes.fluid,
				adSizes.halfPage,
				adSizes.fluid,
				adSizes.mpu,
			],
			desktop: [adSizes.halfPage, adSizes.mpu],
			phablet: [adSizes.outOfPage, adSizes.mobilesticky],
			tablet: [adSizes.merchandising, adSizes.merchandisingHigh],
		});
	});
});

describe('sizeMappingToString', () => {
	it('generates correct strings', () => {
		expect(
			sizeMappingsToString({
				mobile: [adSizes.halfPage, adSizes.fluid, adSizes.fabric],
				tablet: [adSizes.merchandising, adSizes.fluid, adSizes.mpu],
				desktop: [adSizes.portrait, adSizes.mpu],
			}),
		).toEqual({
			mobile: `${adSizes.halfPage.toString()}|${adSizes.fluid.toString()}|${adSizes.fabric.toString()}`,
			tablet: `${adSizes.merchandising.toString()}|${adSizes.fluid.toString()}|${adSizes.mpu.toString()}`,
			desktop: `${adSizes.portrait.toString()}|${adSizes.mpu.toString()}`,
		});
	});
});
