import once from 'lodash/once';
import {
	isInAuOrNz,
	isInRow,
	isInUk,
	isInUsOrCa,
} from 'common/modules/commercial/geo-utils';
import { isInABTestSynchronous } from 'common/modules/experiments/ab';
import { improveSkins } from 'common/modules/experiments/tests/improve-skins';
import config from '../../../../lib/config';
import { getBreakpoint, isBreakpoint } from '../../../../lib/detect';
import { pbTestNameMap } from '../../../../lib/url';

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

export const removeFalseyValues = (
	o: Record<string, string>,
): Record<string, string> =>
	Object.keys(o).reduce((m: Record<string, string>, k: string) => {
		if (o[k]) {
			m[k] = o[k];
		}
		return m;
	}, {});

export const stripDfpAdPrefixFrom = (s: string): string =>
	stripPrefix(s, 'dfp-ad--');

export const containsMpu = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, [300, 250]);

export const containsDmpu = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, [300, 600]);

export const containsLeaderboard = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, [728, 90]);

export const containsBillboard = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, [970, 250]);

export const containsMpuOrDmpu = (sizes: HeaderBiddingSize[]): boolean =>
	containsMpu(sizes) || containsDmpu(sizes);

export const containsMobileSticky = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, [320, 50]);

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
	switch (getBreakpoint()) {
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
	!isInUsOrCa() &&
	!isInAuOrNz() &&
	(window.guardian.config.switches.prebidOzone ?? false);

export const shouldIncludeAppNexus = (): boolean =>
	isInAuOrNz() ||
	(window.guardian.config.switches.prebidAppnexusUkRow && !isInUsOrCa()) ||
	!!pbTestNameMap().and;

export const shouldIncludeXaxis = (): boolean => isInUk();

export const shouldIncludeImproveDigital = (): boolean => isInUk() || isInRow();
export const shouldIncludeImproveDigitalSkin = (): boolean => {
	if (!(isInUk() || isInRow())) return false;
	return (
		window.guardian.config.page.isFront &&
		getBreakpointKey() === 'D' &&
		isInABTestSynchronous(improveSkins)
	);
};

export const shouldIncludeMobileSticky = once(
	(): boolean =>
		window.location.hash.includes('#mobile-sticky') ||
		(!!window.guardian.config.switches.mobileStickyLeaderboard &&
			isBreakpoint({
				min: 'mobile',
				max: 'mobileLandscape',
			}) &&
			(isInUsOrCa() || isInAuOrNz()) &&
			config.get('page.contentType') === 'Article' &&
			!config.get('page.isHosted')),
);

export const stripMobileSuffix = (s: string): string =>
	stripSuffix(stripSuffix(s, '--mobile'), 'Mobile');

export const stripTrailingNumbersAbove1 = (s: string): string =>
	stripSuffix(s, '([2-9]|\\d{2,})');

export const containsWS = (sizes: HeaderBiddingSize[]): boolean =>
	contains(sizes, [160, 600]);

export const shouldIncludeOnlyA9 = window.location.hash.includes('#only-a9');
