import { createAdSize } from '@guardian/commercial/core';
import { isString } from '@guardian/libs';
import { once } from 'lodash-es';
import {
	getCurrentTweakpoint,
	matchesBreakpoints,
} from 'lib/detect-breakpoint';
import { pbTestNameMap } from '../../../../lib/url';
import {
	isInAuOrNz,
	isInCanada,
	isInRow,
	isInUk,
	isInUsOrCa,
} from '../../../common/modules/commercial/geo-utils';

type StringManipulation = (a: string, b: string) => string;
type RegExpRecords = Record<string, RegExp | undefined>;

const SUFFIX_REGEXPS: RegExpRecords = {};
const stripSuffix: StringManipulation = (s, suffix) => {
	const re =
		SUFFIX_REGEXPS[suffix] ??
		(SUFFIX_REGEXPS[suffix] = new RegExp(`${suffix}$`));
	return s.replace(re, '');
};

const PREFIX_REGEXPS: RegExpRecords = {};
const stripPrefix: StringManipulation = (s, prefix) => {
	const re =
		PREFIX_REGEXPS[prefix] ??
		(PREFIX_REGEXPS[prefix] = new RegExp(`^${prefix}`));
	return s.replace(re, '');
};

const contains = (
	sizes: HeaderBiddingSize[],
	size: HeaderBiddingSize,
): boolean => Boolean(sizes.find((s) => s[0] === size[0] && s[1] === size[1]));

/**
 * Cleans an object for targetting. Removes empty strings and other falsey values.
 * @param o object with falsey values
 * @returns {Record<string, string | string[]>} object with only non-empty strings, or arrays of non-empty strings.
 */
export const removeFalseyValues = <O extends Record<string, unknown>>(
	o: O,
): Record<string, string | string[]> =>
	Object.entries(o).reduce<Record<string, string | string[]>>(
		(prev, curr) => {
			const [key, val] = curr;
			if (!val) return prev;

			if (isString(val)) {
				prev[key] = val;
			}
			if (
				Array.isArray(val) &&
				val.length > 0 &&
				val.some(Boolean) &&
				val.every(isString)
			) {
				prev[key] = val.filter(Boolean);
			}

			return prev;
		},
		{},
	);

export const stripDfpAdPrefixFrom = (s: string): string =>
	stripPrefix(s, 'dfp-ad--');

export const containsMpu = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, createAdSize(300, 250));

export const containsDmpu = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, createAdSize(300, 600));

export const containsLeaderboard = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, createAdSize(728, 90));

export const containsBillboard = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, createAdSize(970, 250));

export const containsMpuOrDmpu = (sizes: HeaderBiddingSize[]): boolean =>
	containsMpu(sizes) || containsDmpu(sizes);

export const containsMobileSticky = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, createAdSize(320, 50));

export const containsLeaderboardOrBillboard = (
	sizes: HeaderBiddingSize[],
): boolean => containsLeaderboard(sizes) || containsBillboard(sizes);

export const getLargestSize = (
	sizes: HeaderBiddingSize[],
): HeaderBiddingSize | null => {
	const reducer = (
		previous: HeaderBiddingSize,
		current: HeaderBiddingSize,
	) => {
		if (previous[0] >= current[0] && previous[1] >= current[1]) {
			return previous;
		}
		return current;
	};
	return sizes.length > 0 ? sizes.reduce(reducer) : null;
};

export const getBreakpointKey = (): string => {
	switch (getCurrentTweakpoint()) {
		case 'mobile':
		case 'mobileMedium':
		case 'mobileLandscape':
			return 'M';

		case 'phablet':
		case 'tablet':
			return 'T';

		case 'desktop':
		case 'leftCol':
		case 'wide':
			return 'D';

		default:
			return 'M';
	}
};

export const getRandomIntInclusive = (
	minimum: number,
	maximum: number,
): number => {
	const min = Math.ceil(minimum);
	const max = Math.floor(maximum);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shouldIncludeSonobi = (): boolean => isInUsOrCa();

export const shouldIncludeOpenx = (): boolean => !isInUsOrCa();

export const shouldIncludeTrustX = (): boolean => isInUsOrCa();

export const shouldIncludeTripleLift = (): boolean => isInUsOrCa();

export const shouldIncludeAdYouLike = (
	slotSizes: HeaderBiddingSize[],
): boolean => containsMpu(slotSizes);

// TODO: Check is we want regional restrictions on where we load the ozoneBidAdapter
export const shouldUseOzoneAdaptor = (): boolean =>
	!isInCanada() &&
	!isInAuOrNz() &&
	(window.guardian.config.switches.prebidOzone ?? false);

export const shouldIncludeAppNexus = (): boolean =>
	isInAuOrNz() ||
	(window.guardian.config.switches.prebidAppnexusUkRow && !isInUsOrCa()) ||
	!!pbTestNameMap().and;

export const shouldIncludeXaxis = (): boolean => isInUk();

export const shouldIncludeImproveDigital = (): boolean => isInUk() || isInRow();
export const shouldIncludeImproveDigitalSkin = (): boolean =>
	!!window.guardian.config.switches.prebidImproveDigitalSkins &&
	window.guardian.config.page.isFront &&
	(isInUk() || isInRow()) &&
	getBreakpointKey() === 'D'; // Desktop only

/**
 * Determine whether to include Criteo as a bidder
 */
export const shouldIncludeCriteo = (): boolean => !isInAuOrNz();

/**
 * Determine whether to include Smart as a prebid bidder
 */
export const shouldIncludeSmart = (): boolean => isInUk() || isInRow();

export const shouldIncludeMobileSticky = once(
	(): boolean =>
		window.location.hash.includes('#mobile-sticky') ||
		(!!window.guardian.config.switches.mobileStickyLeaderboard &&
			matchesBreakpoints({
				min: 'mobile',
				max: 'mobileLandscape',
			}) &&
			(isInUsOrCa() || isInAuOrNz()) &&
			window.guardian.config.page.contentType === 'Article' &&
			!window.guardian.config.page.isHosted),
);

export const stripMobileSuffix = (s: string): string =>
	stripSuffix(stripSuffix(s, '--mobile'), 'Mobile');

export const stripTrailingNumbersAbove1 = (s: string): string =>
	stripSuffix(s, '([2-9]|\\d{2,})');

export const containsWS = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, createAdSize(160, 600));

export const shouldIncludeOnlyA9 = window.location.hash.includes('#only-a9');
