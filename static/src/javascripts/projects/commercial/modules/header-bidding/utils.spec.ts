/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { createAdSize } from '@guardian/commercial-core';
import type { CountryCode } from '@guardian/libs';
import { _ } from 'common/modules/commercial/geo-utils';
import { isInVariantSynchronous as isInVariantSynchronous_ } from 'common/modules/experiments/ab';
import {
	getCurrentTweakpoint as getCurrentTweakpoint_,
	matchesBreakpoints as matchesBreakpoints_,
} from 'lib/detect-breakpoint';
import { getCountryCode as getCountryCode_ } from 'lib/geolocation';
import {
	getBreakpointKey,
	getLargestSize,
	removeFalseyValues,
	shouldIncludeAdYouLike,
	shouldIncludeAppNexus,
	shouldIncludeImproveDigital,
	shouldIncludeMobileSticky,
	shouldIncludeOpenx,
	shouldIncludeSonobi,
	shouldIncludeTrustX,
	shouldIncludeXaxis,
	stripDfpAdPrefixFrom,
	stripMobileSuffix,
	stripTrailingNumbersAbove1,
} from './utils';

const getCountryCode = getCountryCode_ as jest.MockedFunction<
	typeof getCountryCode_
>;
const getCurrentTweakpoint = getCurrentTweakpoint_ as jest.MockedFunction<
	typeof getCurrentTweakpoint_
>;
const matchesBreakpoints = matchesBreakpoints_ as jest.MockedFunction<
	typeof matchesBreakpoints_
>;
const isInVariantSynchronous = isInVariantSynchronous_ as jest.MockedFunction<
	typeof isInVariantSynchronous_
>;

jest.mock('lodash-es/once', () => (fn: (...args: unknown[]) => unknown) => fn);

jest.mock('../../../../lib/geolocation', () => ({
	getCountryCode: jest.fn(() => 'GB'),
}));

jest.mock('../../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(),
}));

jest.mock('lib/detect-breakpoint', () => ({
	getCurrentTweakpoint: jest.fn(() => 'mobile'),
	matchesBreakpoints: jest.fn(),
}));

jest.mock('../../../common/modules/experiments/ab-tests');

const resetConfig = () => {
	window.guardian.config.switches.prebidAppnexus = true;
	window.guardian.config.switches.prebidAppnexusInvcode = false;
	window.guardian.config.switches.prebidOpenx = true;
	window.guardian.config.switches.prebidImproveDigital = true;
	window.guardian.config.switches.prebidIndexExchange = true;
	window.guardian.config.switches.prebidSonobi = true;
	window.guardian.config.switches.prebidTrustx = true;
	window.guardian.config.switches.prebidXaxis = true;
	window.guardian.config.switches.prebidAdYouLike = true;
	window.guardian.config.page.contentType = 'Article';
	window.guardian.config.page.section = 'Magic';
	window.guardian.config.page.edition = 'UK';
	window.guardian.config.page.isDev = false;
};

describe('Utils', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		_.resetModule();
		resetConfig();
	});

	test('stripPrefix correctly strips valid cases', () => {
		const validStrips: string[][] = [
			['dfp-ad--slot', 'slot'],
			['slot', 'slot'],
			['dfp-ad--', ''],
		];

		validStrips.forEach(([stringToStrip, result]) => {
			expect(stripDfpAdPrefixFrom(stringToStrip)).toEqual(result);
		});
	});

	test('stripPrefix correctly behaves in invalid case', () => {
		expect(stripDfpAdPrefixFrom(' dfp-ad--slot')).toEqual(' dfp-ad--slot');
	});

	test('getLargestSize should return only one and the largest size', () => {
		expect(getLargestSize([createAdSize(300, 250)])).toEqual([300, 250]);
		expect(
			getLargestSize([createAdSize(300, 250), createAdSize(300, 600)]),
		).toEqual([300, 600]);
		expect(
			getLargestSize([createAdSize(970, 250), createAdSize(728, 80)]),
		).toEqual([970, 250]);
	});

	test('getLargestSize should return null if no sizes exist', () => {
		expect(getLargestSize([])).toEqual(null);
	});

	test('getCurrentTweakpointKey should find the correct key', () => {
		const breakpoints = [
			'mobile',
			'phablet',
			'tablet',
			'desktop',
			'wide',
		] as const;
		const results = [];
		for (let i = 0; i < breakpoints.length; i += 1) {
			getCurrentTweakpoint.mockReturnValueOnce(breakpoints[i]);
			results.push(getBreakpointKey());
		}
		expect(results).toEqual(['M', 'T', 'T', 'D', 'D']);
	});

	test.each<[CountryCode, 'on' | 'off', boolean]>([
		['AU', 'on', true],
		['AU', 'off', true],
		['NZ', 'on', true],
		['NZ', 'off', true],
		['GB', 'on', true],
		['GB', 'off', false],
		['US', 'on', false],
		['CA', 'on', false],
		['FK', 'on', true],
		['GI', 'on', true],
		['GG', 'on', true],
		['IM', 'on', true],
		['JE', 'on', true],
		['SH', 'on', true],
		['FK', 'off', false],
		['GI', 'off', false],
		['GG', 'off', false],
		['IM', 'off', false],
		['JE', 'off', false],
		['SH', 'off', false],
	])(
		`In %s, if switch is %s, shouldIncludeAppNexus should return %s`,
		(region, switchState, expected) => {
			window.guardian.config.switches.prebidAppnexusUkRow =
				switchState === 'on';
			getCountryCode.mockReturnValue(region);
			expect(shouldIncludeAppNexus()).toBe(expected);
		},
	);

	test('shouldIncludeOpenx should return true if geolocation is GB', () => {
		getCountryCode.mockReturnValueOnce('GB');
		expect(shouldIncludeOpenx()).toBe(true);
	});

	test('shouldIncludeOpenx should return true if within ROW region', () => {
		const testGeos: CountryCode[] = [
			'FK',
			'GI',
			'GG',
			'IM',
			'JE',
			'SH',
			'IE',
		];
		for (let i = 0; i < testGeos.length; i += 1) {
			getCountryCode.mockReturnValueOnce(testGeos[i]);
			expect(shouldIncludeOpenx()).toBe(true);
		}
	});

	test('shouldIncludeOpenx should return false if within US region', () => {
		const testGeos: CountryCode[] = ['CA', 'US'];
		for (let i = 0; i < testGeos.length; i += 1) {
			getCountryCode.mockReturnValue(testGeos[i]);
			expect(shouldIncludeOpenx()).toBe(false);
		}
	});

	test('shouldIncludeOpenx should return true if within AU region', () => {
		const testGeos: CountryCode[] = ['NZ', 'AU'];
		for (let i = 0; i < testGeos.length; i += 1) {
			getCountryCode.mockReturnValue(testGeos[i]);
			expect(shouldIncludeOpenx()).toBe(true);
		}
	});

	test('shouldIncludeTrustX should return true if geolocation is US', () => {
		getCountryCode.mockReturnValueOnce('US');
		expect(shouldIncludeTrustX()).toBe(true);
	});

	test('shouldIncludeTrustX should otherwise return false', () => {
		const testGeos: CountryCode[] = [
			'FK',
			'GI',
			'GG',
			'IM',
			'JE',
			'SH',
			'AU',
		];
		for (let i = 0; i < testGeos.length; i += 1) {
			getCountryCode.mockReturnValueOnce(testGeos[i]);
			expect(shouldIncludeTrustX()).toBe(false);
		}
	});

	test('shouldIncludeImproveDigital should return true if geolocation is GB', () => {
		getCountryCode.mockReturnValue('GB');
		expect(shouldIncludeImproveDigital()).toBe(true);
	});

	test('shouldIncludeImproveDigital should return true if geolocation is ROW', () => {
		getCountryCode.mockReturnValue('FR');
		expect(shouldIncludeImproveDigital()).toBe(true);
	});

	test('shouldIncludeImproveDigital should return false if geolocation is AU', () => {
		getCountryCode.mockReturnValue('AU');
		expect(shouldIncludeImproveDigital()).toBe(false);
	});

	test('shouldIncludeImproveDigital should return false if geolocation is US', () => {
		getCountryCode.mockReturnValue('US');
		expect(shouldIncludeImproveDigital()).toBe(false);
	});

	test('shouldIncludeXaxis should be true if geolocation is GB and opted in AB test variant', () => {
		isInVariantSynchronous.mockImplementationOnce(
			(testId, variantId) => variantId === 'variant',
		);
		window.guardian.config.page.isDev = true;
		getCountryCode.mockReturnValue('GB');
		expect(shouldIncludeXaxis()).toBe(true);
	});

	test('shouldIncludeXaxis should be false if geolocation is not GB', () => {
		window.guardian.config.page.isDev = true;
		const testGeos: CountryCode[] = [
			'FK',
			'GI',
			'GG',
			'IM',
			'JE',
			'SH',
			'AU',
			'US',
			'CA',
			'NZ',
		];
		for (let i = 0; i < testGeos.length; i += 1) {
			getCountryCode.mockReturnValue(testGeos[i]);
			expect(shouldIncludeXaxis()).toBe(false);
		}
	});

	test('shouldIncludeSonobi should return true if geolocation is US', () => {
		const testGeos: CountryCode[] = ['US', 'CA'];
		for (let i = 0; i < testGeos.length; i += 1) {
			getCountryCode.mockReturnValueOnce(testGeos[i]);
			expect(shouldIncludeSonobi()).toBe(true);
		}
	});

	test('shouldIncludeSonobi should otherwise return false', () => {
		const testGeos: CountryCode[] = [
			'FK',
			'GI',
			'GG',
			'IM',
			'JE',
			'SH',
			'AU',
		];
		for (let i = 0; i < testGeos.length; i += 1) {
			getCountryCode.mockReturnValueOnce(testGeos[i]);
			expect(shouldIncludeSonobi()).toBe(false);
		}
	});

	test('stripMobileSuffix', () => {
		expect(stripMobileSuffix('top-above-nav--mobile')).toBe(
			'top-above-nav',
		);
		expect(stripMobileSuffix('inline1--mobile')).toBe('inline1');
	});

	test('stripTrailingNumbersAbove1', () => {
		expect(stripTrailingNumbersAbove1('inline1')).toBe('inline1');
		expect(stripTrailingNumbersAbove1('inline2')).toBe('inline');
		expect(stripTrailingNumbersAbove1('inline10')).toBe('inline');
		expect(stripTrailingNumbersAbove1('inline23')).toBe('inline');
		expect(stripTrailingNumbersAbove1('inline101')).toBe('inline');
		expect(stripTrailingNumbersAbove1('inline456')).toBe('inline');
	});

	test('shouldIncludeAdYouLike when not in any tests', () => {
		expect(shouldIncludeAdYouLike([createAdSize(300, 250)])).toBe(true);
		expect(
			shouldIncludeAdYouLike([
				createAdSize(300, 600),
				createAdSize(300, 250),
			]),
		).toBe(true);
		expect(shouldIncludeAdYouLike([createAdSize(728, 90)])).toBe(false);
	});

	test('removeFalseyValues correctly remove non-truthy values', () => {
		const result = removeFalseyValues({
			testString: 'non empty string',
			testEmptyString: '',
			testNull: null,
			testUndefined: undefined,
			testFalse: false,
			test0: 0,
			testNan: NaN,
		});

		expect(result).toEqual({
			testString: 'non empty string',
		});
	});

	test('removeFalseyValues correctly keeps arrays of strings', () => {
		const result = removeFalseyValues({
			testString: 'non empty string',
			testArraysWithEmptyStrings: ['a', '', 'b', '', 'c'],
			testEmptyArray: [],
			testArrayOfEmptyStrings: ['', '', ''],
			testArrayOfNonStrings: ['a', null, 0],
		});

		expect(result).toEqual({
			testString: 'non empty string',
			testArraysWithEmptyStrings: ['a', 'b', 'c'],
		});
	});

	const regions: CountryCode[] = ['US', 'CA', 'AU', 'NZ'];

	regions.forEach((region) => {
		test(`should include mobile sticky if geolocation is ${region}, switch is ON and content is Article on mobiles`, () => {
			window.guardian.config.page.contentType = 'Article';
			window.guardian.config.switches.mobileStickyLeaderboard = true;
			getCountryCode.mockReturnValue(region);
			matchesBreakpoints.mockReturnValue(true);
			expect(shouldIncludeMobileSticky()).toBe(true);
		});
	});

	test('shouldIncludeMobileSticky should be false if all conditions true except content type ', () => {
		window.guardian.config.page.contentType = 'Network Front';
		window.guardian.config.switches.mobileStickyLeaderboard = true;
		matchesBreakpoints.mockReturnValue(true);
		getCountryCode.mockReturnValue('US');
		expect(shouldIncludeMobileSticky()).toBe(false);
	});

	test('shouldIncludeMobileSticky should be false if all conditions true except switch', () => {
		window.guardian.config.page.contentType = 'Article';
		matchesBreakpoints.mockReturnValue(true);
		window.guardian.config.switches.mobileStickyLeaderboard = false;
		getCountryCode.mockReturnValue('US');
		expect(shouldIncludeMobileSticky()).toBe(false);
	});

	test('shouldIncludeMobileSticky should be false if all conditions true except isHosted condition', () => {
		window.guardian.config.page.contentType = 'Article';
		matchesBreakpoints.mockReturnValue(true);
		window.guardian.config.switches.mobileStickyLeaderboard = true;
		window.guardian.config.page.isHosted = true;
		getCountryCode.mockReturnValue('US');
		expect(shouldIncludeMobileSticky()).toBe(false);
	});

	test('shouldIncludeMobileSticky should be false if all conditions true except continent', () => {
		window.guardian.config.page.contentType = 'Article';
		window.guardian.config.switches.mobileStickyLeaderboard = true;
		matchesBreakpoints.mockReturnValue(true);
		getCountryCode.mockReturnValue('GB');
		expect(shouldIncludeMobileSticky()).toBe(false);
	});

	test('shouldIncludeMobileSticky should be false if all conditions true except mobile', () => {
		window.guardian.config.page.contentType = 'Article';
		window.guardian.config.switches.mobileStickyLeaderboard = true;
		matchesBreakpoints.mockReturnValue(false);
		getCountryCode.mockReturnValue('US');
		expect(shouldIncludeMobileSticky()).toBe(false);
	});

	test('shouldIncludeMobileSticky should be true if test param exists irrespective of other conditions', () => {
		window.guardian.config.page.contentType = 'Network Front';
		window.guardian.config.switches.mobileStickyLeaderboard = false;
		matchesBreakpoints.mockReturnValue(false);
		getCountryCode.mockReturnValue('US');
		window.location.hash = '#mobile-sticky';
		expect(shouldIncludeMobileSticky()).toBe(true);
	});
});
