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
				? [[300, 250]]
				: [
						[300, 600],
						[300, 250],
				  ],
		},
	];
	const desktopSlots: HeaderBiddingSlot[] = [
		{
			key: 'top-above-nav',
			sizes: [
				[970, 250],
				[728, 90],
			],
		},
		{
			key: 'inline',
			sizes: isArticle
				? [
						[160, 600],
						[300, 600],
						[300, 250],
				  ]
				: [[300, 250]],
		},
		{
			key: 'inline1',
			sizes: isArticle
				? [
						[300, 250],
						[550, 310],
						[620, 350],
				  ]
				: isCrossword
				? [[728, 90]]
				: [[300, 250]],
		},
		{
			key: 'mostpop',
			sizes: hasExtendedMostPop
				? [
						[300, 600],
						[300, 250],
				  ]
				: [[300, 250]],
		},
		{
			key: 'comments',
			sizes: [
				[160, 600],
				[300, 250],
				[300, 600],
			],
		},
		// Banner slots appear on interactives, like on
		// https://www.theguardian.com/us-news/ng-interactive/2018/nov/06/midterm-elections-2018-live-results-latest-winners-and-seats
		{
			key: 'banner',
			sizes: [
				[88, 70],
				[728, 90],
				[940, 230],
				[900, 250],
				[970, 250],
			],
		},
	];
	const tabletSlots: HeaderBiddingSlot[] = [
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
			sizes: isArticle
				? [
						[300, 250],
						[550, 310],
						[620, 350],
				  ]
				: isCrossword
				? [[728, 90]]
				: [[300, 250]],
		},
		{
			key: 'mostpop',
			sizes: hasExtendedMostPop
				? [
						[300, 600],
						[300, 250],
						[728, 90],
				  ]
				: [[300, 250]],
		},
	];
	const mobileSlots: HeaderBiddingSlot[] = [
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
			sizes: isArticle
				? [
						[300, 197],
						[300, 250],
				  ]
				: [[300, 250]],
		},
		{
			key: 'mostpop',
			sizes: [[300, 250]],
		},
	];
	const mobileStickySlot: HeaderBiddingSlot = {
		key: 'mobile-sticky',
		sizes: [[320, 50]],
	};

	switch (getBreakpointKey()) {
		case 'M':
			return shouldIncludeMobileSticky() &&
				window.guardian.config.switches.mobileStickyPrebid
				? commonSlots.concat([...mobileSlots, mobileStickySlot])
				: commonSlots.concat(mobileSlots);
		case 'T':
			return commonSlots.concat(tabletSlots);
		default:
			return commonSlots.concat(desktopSlots);
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
