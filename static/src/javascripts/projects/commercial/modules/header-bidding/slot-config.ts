import { adSizes, createAdSize } from '@guardian/commercial-core';
import type { AdSize } from '@guardian/commercial-core';
import type { Advert } from 'commercial/modules/dfp/Advert';
import {
	getBreakpointKey,
	shouldIncludeMobileSticky,
	stripMobileSuffix,
	stripTrailingNumbersAbove1,
} from './utils';

const slotKeyMatchesAd = (pbs: HeaderBiddingSlot, ad: Advert): boolean =>
	stripTrailingNumbersAbove1(stripMobileSuffix(ad.id)).endsWith(pbs.key);

const REGEX_DFP_AD = /^dfp-ad--\d+/;

const getHbBreakpoint = () => {
	switch (getBreakpointKey()) {
		case 'M':
			return 'mobile';
		case 'T':
			return 'tablet';
		default:
			return 'desktop';
	}
};

/**
 * Remove any header bidding sizes that do not appear in the set
 * of slot sizes for the current breakpoint
 *
 * NOTE we currently only perform this filtering on `inline` slots
 * (this does not include inline1)
 */
const filterBySizeMapping =
	(slotSizes: AdSize[] = []) =>
	({ key, sizes }: HeaderBiddingSlot): HeaderBiddingSlot => {
		// For now, only apply filtering to inline header bidding slots
		// In the future we may want to expand this to all slots
		if (key !== 'inline') {
			return { key, sizes };
		}

		const filteredSizes = sizes.filter(([hbWidth, hbHeight]) =>
			slotSizes.some(
				(adSize) =>
					hbWidth === adSize.width && hbHeight === adSize.height,
			),
		);

		return {
			key,
			sizes: filteredSizes,
		};
	};

const filterByAdvert = (
	ad: Advert,
	slots: HeaderBiddingSlot[],
): HeaderBiddingSlot[] => {
	const adUnits = slots.filter((slot) => {
		if (slot.key === 'banner') {
			// Special case for interactive banner slots
			// as they are currently incorrectly identified.
			const isDfpAd = (id: string) => !!REGEX_DFP_AD.exec(id);
			return (
				(isDfpAd(ad.id) &&
					ad.node.classList.contains('ad-slot--banner-ad-desktop')) ||
				slotKeyMatchesAd(slot, ad)
			);
		}

		return slotKeyMatchesAd(slot, ad);
	});
	return adUnits;
};

const getSlots = (
	breakpoint: 'mobile' | 'tablet' | 'desktop',
): HeaderBiddingSlot[] => {
	const { contentType, hasShowcaseMainElement } = window.guardian.config.page;
	const isArticle = contentType === 'Article';
	const isCrossword = contentType === 'Crossword';
	const hasExtendedMostPop =
		isArticle && window.guardian.config.switches.extendedMostPopular;

	const commonSlots: HeaderBiddingSlot[] = [
		{
			key: 'right',
			sizes: hasShowcaseMainElement
				? [adSizes.mpu]
				: [adSizes.halfPage, adSizes.mpu],
		},
	];
	const desktopSlots: HeaderBiddingSlot[] = [
		{
			key: 'top-above-nav',
			sizes: [adSizes.billboard, adSizes.leaderboard],
		},
		{
			key: 'inline',
			sizes: isArticle
				? [adSizes.skyscraper, adSizes.halfPage, adSizes.mpu]
				: [adSizes.mpu],
		},
		{
			key: 'inline1',
			sizes: isArticle
				? [adSizes.mpu, adSizes.outstreamDesktop]
				: [adSizes.mpu],
		},
		{
			key: 'mostpop',
			sizes: hasExtendedMostPop
				? [adSizes.halfPage, adSizes.mpu]
				: [adSizes.mpu],
		},
		{
			key: 'comments',
			sizes: [adSizes.skyscraper, adSizes.mpu, adSizes.halfPage],
		},
		// Banner slots appear on interactives, like on
		// https://www.theguardian.com/us-news/ng-interactive/2018/nov/06/midterm-elections-2018-live-results-latest-winners-and-seats
		{
			key: 'banner',
			sizes: [
				createAdSize(88, 70),
				adSizes.leaderboard,
				adSizes.cascade,
				createAdSize(900, 250),
				adSizes.billboard,
			],
		},
	];
	const tabletSlots: HeaderBiddingSlot[] = [
		{
			key: 'top-above-nav',
			sizes: [adSizes.leaderboard],
		},
		{
			key: 'inline',
			sizes: [adSizes.mpu],
		},
		{
			key: 'inline1',
			sizes: isArticle
				? [adSizes.mpu, adSizes.outstreamDesktop]
				: [adSizes.mpu],
		},
		{
			key: 'mostpop',
			sizes: hasExtendedMostPop
				? [adSizes.halfPage, adSizes.mpu, adSizes.leaderboard]
				: [adSizes.mpu],
		},
	];
	const mobileSlots: HeaderBiddingSlot[] = [
		{
			key: 'top-above-nav',
			sizes: [adSizes.mpu],
		},
		{
			key: 'inline',
			sizes: [adSizes.mpu],
		},
		{
			key: 'inline1',
			sizes: isArticle
				? [
						adSizes.outstreamMobile,
						adSizes.mpu,
						adSizes.portraitInterstitial,
				  ]
				: [adSizes.mpu],
		},
		{
			key: 'mostpop',
			sizes: [adSizes.mpu],
		},
	];
	const mobileStickySlot: HeaderBiddingSlot = {
		key: 'mobile-sticky',
		sizes: [adSizes.mobilesticky],
	};

	const crosswordBannerSlot: HeaderBiddingSlot = {
		key: 'crossword-banner',
		sizes: [adSizes.leaderboard],
	};

	const crosswordSlots = isCrossword ? [crosswordBannerSlot] : [];

	switch (breakpoint) {
		case 'mobile':
			return shouldIncludeMobileSticky() &&
				window.guardian.config.switches.mobileStickyPrebid
				? commonSlots.concat([...mobileSlots, mobileStickySlot])
				: commonSlots.concat(mobileSlots);
		case 'tablet':
			return commonSlots.concat(tabletSlots, crosswordSlots);
		default:
			return commonSlots.concat(desktopSlots, crosswordSlots);
	}
};

export const getHeaderBiddingAdSlots = (
	ad: Advert,
	slotFlatMap?: SlotFlatMap,
): HeaderBiddingSlot[] => {
	const effectiveSlotFlatMap = slotFlatMap ?? ((s) => [s]); // default to identity
	const breakpoint = getHbBreakpoint();
	const headerBiddingSlots = filterByAdvert(ad, getSlots(breakpoint));
	return headerBiddingSlots
		.map(filterBySizeMapping(ad.sizes[breakpoint]))
		.map(effectiveSlotFlatMap)
		.reduce((acc, elt) => acc.concat(elt), []); // the "flat" in "flatMap"
};

export const _ = {
	getSlots,
};
