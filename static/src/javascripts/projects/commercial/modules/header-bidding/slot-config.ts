import { adSizes } from '@guardian/commercial-core';
import type { Advert } from 'commercial/modules/dfp/Advert';
import config from '../../../../lib/config';
import {
	getBreakpointKey,
	shouldIncludeMobileSticky,
	stripMobileSuffix,
	stripTrailingNumbersAbove1,
} from './utils';

const slotKeyMatchesAd = (pbs: HeaderBiddingSlot, ad: Advert): boolean =>
	stripTrailingNumbersAbove1(stripMobileSuffix(ad.id)).endsWith(pbs.key);

const REGEX_DFP_AD = /^dfp-ad--\d+/;

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

const getSlots = (contentType: string): HeaderBiddingSlot[] => {
	const isArticle = contentType === 'Article';
	const isCrossword = contentType === 'Crossword';
	const hasShowcase = config.get(
		'page.hasShowcaseMainElement',
		false,
	) as boolean; // TODO : remove type assertion
	const hasExtendedMostPop =
		isArticle && window.guardian.config.switches.extendedMostPopular;

	const commonSlots: HeaderBiddingSlot[] = [
		{
			key: 'right',
			sizes: hasShowcase
				? [[adSizes.mpu.width, adSizes.mpu.height]]
				: [
						[adSizes.halfPage.width, adSizes.halfPage.height],
						[adSizes.mpu.width, adSizes.mpu.height],
				  ],
		},
	];
	const desktopSlots: HeaderBiddingSlot[] = [
		{
			key: 'top-above-nav',
			sizes: [
				[adSizes.billboard.width, adSizes.billboard.height],
				[adSizes.leaderboard.width, adSizes.leaderboard.height],
			],
		},
		{
			key: 'inline',
			sizes: isArticle
				? [
						[adSizes.skyscraper.width, adSizes.skyscraper.height],
						[adSizes.halfPage.width, adSizes.halfPage.height],
						[adSizes.mpu.width, adSizes.mpu.height],
				  ]
				: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
		{
			key: 'inline1',
			sizes: isArticle
				? [
						[adSizes.mpu.width, adSizes.mpu.height],
						[
							adSizes.outstreamDesktop.width,
							adSizes.outstreamDesktop.height,
						],
				  ]
				: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
		{
			key: 'mostpop',
			sizes: hasExtendedMostPop
				? [
						[adSizes.halfPage.width, adSizes.halfPage.height],
						[adSizes.mpu.width, adSizes.mpu.height],
				  ]
				: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
		{
			key: 'comments',
			sizes: [
				[adSizes.skyscraper.width, adSizes.skyscraper.height],
				[adSizes.mpu.width, adSizes.mpu.height],
				[adSizes.halfPage.width, adSizes.halfPage.height],
			],
		},
		// Banner slots appear on interactives, like on
		// https://www.theguardian.com/us-news/ng-interactive/2018/nov/06/midterm-elections-2018-live-results-latest-winners-and-seats
		{
			key: 'banner',
			sizes: [
				[88, 70],
				[adSizes.leaderboard.width, adSizes.leaderboard.height],
				[adSizes.cascade.width, adSizes.cascade.height],
				[900, 250],
				[adSizes.billboard.width, adSizes.billboard.height],
			],
		},
	];
	const tabletSlots: HeaderBiddingSlot[] = [
		{
			key: 'top-above-nav',
			sizes: [[adSizes.leaderboard.width, adSizes.leaderboard.height]],
		},
		{
			key: 'inline',
			sizes: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
		{
			key: 'inline1',
			sizes: isArticle
				? [
						[adSizes.mpu.width, adSizes.mpu.height],
						[
							adSizes.outstreamDesktop.width,
							adSizes.outstreamDesktop.height,
						],
				  ]
				: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
		{
			key: 'mostpop',
			sizes: hasExtendedMostPop
				? [
						[adSizes.halfPage.width, adSizes.halfPage.height],
						[adSizes.mpu.width, adSizes.mpu.height],
						[adSizes.leaderboard.width, adSizes.leaderboard.height],
				  ]
				: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
	];
	const mobileSlots: HeaderBiddingSlot[] = [
		{
			key: 'top-above-nav',
			sizes: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
		{
			key: 'inline',
			sizes: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
		{
			key: 'inline1',
			sizes: isArticle
				? [
						[
							adSizes.outstreamMobile.width,
							adSizes.outstreamMobile.height,
						],
						[adSizes.mpu.width, adSizes.mpu.height],
				  ]
				: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
		{
			key: 'mostpop',
			sizes: [[adSizes.mpu.width, adSizes.mpu.height]],
		},
	];
	const mobileStickySlot: HeaderBiddingSlot = {
		key: 'mobile-sticky',
		sizes: [[adSizes.mobilesticky.width, adSizes.mobilesticky.height]],
	};

	const crosswordBannerSlot: HeaderBiddingSlot = {
		key: 'crossword-banner',
		sizes: [[adSizes.leaderboard.width, adSizes.leaderboard.height]],
	};

	const crosswordSlots = isCrossword ? [crosswordBannerSlot] : [];

	switch (getBreakpointKey()) {
		case 'M':
			return shouldIncludeMobileSticky() &&
				window.guardian.config.switches.mobileStickyPrebid
				? commonSlots.concat([...mobileSlots, mobileStickySlot])
				: commonSlots.concat(mobileSlots);
		case 'T':
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

	const adSlots = filterByAdvert(
		ad,
		getSlots(config.get('page.contentType', '')),
	);
	return adSlots
		.map(effectiveSlotFlatMap)
		.reduce((acc, elt) => acc.concat(elt), []); // the "flat" in "flatMap"
};

export const _ = {
	getSlots,
};
